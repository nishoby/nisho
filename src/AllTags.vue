<template>
    <div class="main-container container">
        <div class="cards-div">
            <div class="card">
                <h2>Усе тэгі</h2>

                <p v-if="loading" class="tag-cloud__note">Збіраем тэгі…</p>
                <p v-else-if="failed" class="tag-cloud__note">
                    Не атрымалася загрузіць тэгі. Паспрабуй абнавіць старонку.
                </p>

                <div v-else class="tag-cloud">
                    <router-link
                        v-for="tag in cloud"
                        :key="tag.key"
                        class="tag-cloud__tag"
                        :class="{ 'tag-cloud__tag--single': tag.count === 1 }"
                        :style="{ fontSize: tag.size + 'rem' }"
                        :title="tag.count + ' ' + wordsLabel(tag.count)"
                        :to="{ name: 'terms', query: tag.query }"
                    >
                        {{ tag.name }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { supabase } from './supabase.js';

const loading = ref(true);
const failed = ref(false);
const usage = ref(new Map());
// словы, да якіх не прычаплены ніводзін тэг: у воблаку іх не відаць, а знайсці
// іх інакш як гартаннем немагчыма
const untagged = ref(0);

// Той самы падлік, што на галоўнай фарбуе тэгі ў шэры/зялёны: забіраем тэгі
// ўсіх слоў і лічым у браўзеры. Часовае рашэнне, пакуль слоў мала, — пры
// дзясятках тысяч слоў лічыць трэба будзе ў базе.
const loadTagUsage = async () => {
    const counted = new Map();
    let withoutTags = 0;
    const step = 1000;
    for (let from = 0; ; from += step) {
        const { data, error } = await supabase
            .from('terms')
            .select('tags')
            .range(from, from + step - 1);
        if (error) {
            throw error;
        }
        for (const row of data) {
            if (!row.tags || !row.tags.length) {
                withoutTags += 1;
            }

            const seen = new Set();
            for (const raw of row.tags || []) {
                const key = raw.trim().toLowerCase();
                if (!key) {
                    continue;
                }
                if (!counted.has(key)) {
                    counted.set(key, { count: 0, spellings: new Set() });
                }
                const entry = counted.get(key);
                // слова лічым адзін раз, нават калі тэг паўтараецца ў ім некалькі разоў
                if (!seen.has(key)) {
                    seen.add(key);
                    entry.count += 1;
                }
                entry.spellings.add(raw);
            }
        }
        if (data.length < step) {
            break;
        }
    }
    usage.value = counted;
    untagged.value = withoutTags;
};

// «Мова» і «мова » — адзін тэг з рознымі напісаннямі; паказваем адно,
// аддаючы перавагу акуратнаму малому напісанню без хвастовых прабелаў
const displayName = (key, spellings) => {
    for (const raw of spellings) {
        if (raw === key) {
            return raw;
        }
    }
    return [...spellings][0].trim();
};

// Памер расце як лагарыфм колькасці слоў: раз ад разу розніца прыкметная,
// але тэг з сотняй слоў не засланяе сабой паўстаронкі
const cloud = computed(() => {
    const entries = [...usage.value.entries()];
    if (!entries.length) {
        return [];
    }
    const maxCount = Math.max(...entries.map(([, entry]) => entry.count));
    const maxLog = Math.log(maxCount + 1);

    const cloud = entries
        .map(([key, entry]) => ({
            key,
            name: displayName(key, entry.spellings),
            count: entry.count,
            query: { tag: displayName(key, entry.spellings) },
            size: 0.875 + (Math.log(entry.count + 1) / maxLog) * 1.125,
        }))
        .sort((a, b) => a.key.localeCompare(b.key, 'be'));

    // словы без тэгаў — такая ж пілюля, але ў канцы: гэта не слова з алфавіту
    if (untagged.value) {
        cloud.push({
            key: 'untagged',
            name: 'Без тэгаў',
            count: untagged.value,
            query: { biez: 'tehau' },
            size: 0.875 + (Math.log(untagged.value + 1) / maxLog) * 1.125,
        });
    }

    return cloud;
});

const wordsLabel = (count) => {
    const tens = count % 100;
    const ones = count % 10;
    if (tens >= 11 && tens <= 14) {
        return 'слоў';
    }
    if (ones === 1) {
        return 'слова';
    }
    if (ones >= 2 && ones <= 4) {
        return 'словы';
    }
    return 'слоў';
};

onMounted(async () => {
    try {
        await loadTagUsage();
    } catch (error) {
        console.error(error);
        failed.value = true;
    }
    loading.value = false;
});
</script>

<style scoped></style>
