<script setup>
import { onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { takeGreeting } from './welcome.js';

// Чалавек вярнуўся з ліста. Сказаць пра гэта трэба тут, у корані праграмы, а
// не на нейкай старонцы: Supabase вяртае яго туды, куды сам вырашыць, і
// прывітанне не мае права залежаць ад таго, куды ён трапіў.
onMounted(() => {
    const greeting = takeGreeting();

    if (greeting === 'welcome') {
        ElMessage.success('Вітаем у Нішо! Цяпер ты можаш дадаваць свае словы і ставіць лайкі.');
    }

    // Спасылка з ліста жыве не вечна. Без гэтага паведамлення чалавек націснуў
    // бы ў лісце, вярнуўся на сайт — і не ўбачыў нічога, а потым не зразумеў,
    // чаму ўваход не пускае.
    //
    // Яно не знікае само, у адрозненне ад прывітання: тут трэба нешта зрабіць,
    // а не проста прачытаць.
    if (greeting === 'expired') {
        ElMessage({
            type: 'warning',
            duration: 0,
            showClose: true,
            dangerouslyUseHTMLString: true,
            customClass: 'notice-message',
            message:
                '<p class="notice-note_main">Спасылка састарэла</p>' +
                '<p class="notice-note_body">Запытай новы ліст, каб пацвердзіць электронную пошту.</p>',
        });
    }
});
</script>

<template>
    <router-view :key="$route.fullPath" />
</template>

<style scoped></style>
