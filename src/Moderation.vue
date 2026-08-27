<template>
    <div class="main-container container moderation-page">
        <!-- Загаловак з лічбай пад ім — адным слупком злева, «гісторыя» — з
             правага краю. Раней усе трое стаялі ў адным радку і на тэлефоне
             разыходзіліся як прыйдзецца: «гісторыя» падала пад загаловак, а
             лічба апыналася пад ёй. Цяпер парадак трымае разметка, а не
             выпадковая шырыня экрана. -->
        <div class="moderation-head">
            <span class="moderation-head_left">
                <span class="my-words-title">Мадэрацыя</span>

                <!-- Лічбы без ніводнага службовага слова: на старонцы, якая
                     называецца «Мадэрацыя», і са спісам скаргаў пад ёй «4 з 9»
                     чытаецца само. Раней тут стаяў цэлы радок «засталося 4 з 9
                     скаргаў» — тры словы дзеля дзвюх лічбаў. -->
                <span class="moderation-count" v-if="open.length && view === 'queue'">
                    {{ open.length }} з {{ batchTotal }} слоў
                </span>
            </span>

            <!-- гісторыя з правага краю: гэта не дзеянне над словамі, а другі
                 від таго ж спісу, і месца яму з іншага боку ад загалоўка -->
            <span class="moderation-views">
                <!-- Баня — гэта і ёсць бан на нашай мове: «ты ў бане». Спіс тых, каго
                     туды адправілі, з тэрмінам і прычынай.

                     Стаіць першай, а не пасля гадзінніка: у яе радзей заходзяць, і
                     промах пальцам туды менш прыкры, чым промах у гісторыю пасярод
                     разбору. Прамежак паміж імі большы за звычайны — на тэлефоне
                     два значкі ўшчыльную зліваюцца ў адну мішэнь. -->
                <button
                    class="moderation-history"
                    type="button"
                    v-if="view !== 'history'"
                    :title="view === 'bans' ? 'Назад да скаргаў' : 'Хто ў бане'"
                    :aria-label="view === 'bans' ? 'Назад да скаргаў' : 'Хто ў бане'"
                    @click="view = view === 'bans' ? 'queue' : 'bans'"
                >
                    <IconSauna class="moderation-history_icon" v-if="view !== 'bans'" />
                    <template v-else>скаргі</template>
                </button>

                <!-- Значок гадзінніка замест слова «гісторыя»: ён зразумелы без
                     подпісу і не займае паўрадка. А вось назад слова застаецца —
                     значка «вярнуцца да скаргаў» такога ж яснага няма. -->
                <button
                    class="moderation-history"
                    type="button"
                    v-if="view !== 'bans'"
                    :title="view === 'history' ? 'Назад да скаргаў' : 'Гісторыя'"
                    :aria-label="view === 'history' ? 'Назад да скаргаў' : 'Гісторыя'"
                    @click="view = view === 'history' ? 'queue' : 'history'"
                >
                    <IconHistory class="moderation-history_icon" v-if="view !== 'history'" />
                    <template v-else>скаргі</template>
                </button>
            </span>
        </div>

        <!-- Пазнака адбору — асобным радком пад загалоўкам, а не ў ім. У адным
             радку яна выштурхоўвала «гісторыю» на наступны, і шапка скакала на
             дзве вышыні кожны раз, як хтосьці націскаў імя. -->
        <div class="moderation-filter_row" v-if="personFilter && view !== 'bans'">
            <span class="moderation-filter_line">
                <button class="moderation-filter" type="button" @click="personFilter = null">
                    {{ filterLabel }}
                    <span class="moderation-filter_x"><IconCross /></span>
                </button>
            </span>

            <!-- Парадак чытання: хто → што пра яго вядома → што з ім рабіць.
                 Бан у канцы наўмысна: рашэнне прымаюць пасля таго, як прачыталі
                 лічбы, а не да таго. -->
            <!-- Тры лічбы пра тое, як чалавек сябе паказаў: колькі падзяк, які
                 рэйтынг і колькі разоў ягоная скарга была не па справе. Колькі
                 скаргаў ён напісаў усяго — не паказваем: само па сабе гэта не
                 кажа нічога, бо дзесяць слушных і дзесяць пустых чытаюцца
                 аднолькава. -->
            <span class="moderation-person_stats" v-if="filterPerson && filterPerson.person">
                <IconMedal class="moderation-person_medal" />
                {{ filterPerson.person.praised || 0 }}

                ·
                <IconStar class="moderation-person_star" />
                {{ scoreOf(filterPerson.person) }}

                <!-- Мінус са свайго ж значка на картцы: столькі разоў мадэратар
                     націснуў «−1». Рэйтынг ад гэтага не адымаем яшчэ раз — такая
                     скарга проста не трапіла ва ўхваленыя, і бал за яе ўжо
                     не залічаны. -->
                <template v-if="filterPerson.person.dismissed">
                    ·
                    <span class="moderation-person_minus" :title="timesLabel(filterPerson.person.dismissed)"
                        >−{{ filterPerson.person.dismissed }}</span
                    >
                </template>
            </span>

            <button
                class="moderation-ban moderation-person_ban"
                type="button"
                v-if="filterPerson && personFilter.name !== ME"
                @click="askBanPerson(filterPerson)"
            >
                <IconSkull class="moderation-ban_icon" />
                Забаніць @{{ personFilter.name }}
            </button>
        </div>

        <!-- Скаргі ўжо сапраўдныя, а запісваць рашэнні назад у базу яшчэ няма
             чым. Пра гэта трэба сказаць уголас і на самой старонцы: інакш
             мадэратар разбярэ ўсю чаргу, абновіць старонку — і ўбачыць яе
             цэлай. Гэты радок сыдзе разам з першымі функцыямі запісу. -->
        <p class="note" v-if="view === 'queue' && !loading && !loadError && list.length">
            Рашэнні пакуль не захоўваюцца — пасля абнаўлення чарга вернецца.
        </p>

        <!-- Поўныя карткі — толькі для таго, што яшчэ трэба разабраць. Ужо
             разгледжанае паказваем радком: правіць там няма чаго, а слова,
             прыбранае з сайта, у выглядзе карткі і зусім не мае сэнсу —
             паказвалі б тое, чаго на сайце ўжо няма. -->
        <div class="moderation-list" v-if="view === 'queue'">
            <div class="card moderation-card" v-for="item of pageItems" :key="item.id">
                <!-- Скаргі на слова. Іх можа быць некалькі: людзі заўважаюць адну і
                     тую ж памылку паасобку і пішуць кожны сваё. Раней кожная
                     рабіла сваю картку, і мадэратар разбіраў адно слова тры разы.
                     Цяпер картка — гэта слова, а скаргі ў ёй спісам. -->
                <div class="moderation-complaint">
                    <div class="moderation-complaint_item" v-for="(c, i) of item.complaints" :key="c.id">
                        <div class="moderation-complaint_head">
                            <!-- Прычыну паўторна не пішам: калі трое напісалі пра адну
                                 і тую ж памылку, тры разы «памылка ў тэксце» нічога не
                                 дадаюць, а радок займаюць. -->
                            <span
                                class="moderation-reason"
                                v-if="i === 0 || c.reason !== item.complaints[i - 1].reason"
                                >{{ REASONS[c.reason] }}</span
                            >
                            <span class="moderation-date">{{ c.date }}</span>

                            <!-- нумар карткі з правага краю, адзін на слова: па ім
                                 відаць, што ўжо разбіралі, і ёсць чым назваць слова
                                 ў размове -->
                            <span class="moderation-num" v-if="i === 0">№{{ item.id }}</span>
                        </div>

                        <p class="moderation-comment" v-if="c.comment">«{{ c.comment }}»</p>

                        <!-- імя таго, хто паскардзіўся, — пад самой скаргай, як
                             подпіс пад цытатай. Бывае пустое: скаргу пакідае толькі
                             той, хто ўвайшоў, але імя ў профілі можа не стаяць -->
                        <div class="moderation-by" v-if="c.by">
                            <!-- Тая ж будова, што ў блоку аўтара слова ніжэй: у першым
                                 радку імя злева і дзеянне справа, у другім — лічбы.
                                 Два блокі пра двух розных людзей чытаюцца аднолькава,
                                 і вока не вучыцца ім паасобку. -->
                            <div class="moderation-by_row">
                                <span class="moderation-by_name">
                                    <!-- Паўторная скарга — гэта не проста «яшчэ адна»: слова
                                         ўжо разбіралі і вярнулі на сайт, а чалавек не
                                         пагадзіўся. Значыць, пад пытаннем ранейшае
                                         рашэнне мадэратара, і глядзець трэба ўважлівей. -->
                                    <span
                                        class="moderation-again"
                                        v-if="c.repeat"
                                        title="на гэтае слова ўжо скардзіліся, і яго вярнулі на сайт"
                                        >паўторная</span
                                    >
                                    скарга ад:
                                    <IconStar
                                        class="badge"
                                        v-for="n of starsOf(c.by_person)"
                                        :key="n"
                                        :title="scoreHint(c.by_person)"
                                    />
                                    <!-- Імя вядзе да ўсіх скаргаў гэтага чалавека. Лічбы і бан
                                         жывуць там, а не тут: на картцы глядзяць на скаргу, а не
                                         на таго, хто яе напісаў. Рэпутацыя патрэбна тады, калі
                                         ўжо ўзнікла сумненне, — вось тады па імені і націскаюць. -->
                                    <button
                                        class="moderation-by_person"
                                        type="button"
                                        :title="'Усе скаргі ад ' + c.by"
                                        @click="personFilter = { kind: 'by', name: c.by }"
                                    >
                                        {{ c.by }}
                                    </button>
                                </span>
                                <span class="moderation-verdicts">
                                    <!-- Толькі калі скаргаў на слове некалькі. Пры адной
                                         кнопка не патрэбна: рашэнне па слове і ёсць адказ,
                                         ці была скарга слушная. А калі рашэнне адно на
                                         трох, чалавек, які напісаў міма, атрымаў бы бал
                                         за чужую заўвагу. Гэты націск здымае яму бал у
                                         нуль — не карае, а проста не залічвае. -->
                                    <button
                                        class="moderation-dismiss"
                                        :class="{ 'moderation-dismiss--on': c.dismissed }"
                                        type="button"
                                        v-if="item.complaints.length > 1 && c.by !== ME"
                                        :title="
                                            c.dismissed
                                                ? 'Націснуць яшчэ раз — вярнуць бал'
                                                : 'Скарга не па справе — бал за яе не залічыцца'
                                        "
                                        @click="dismiss(c)"
                                    >
                                        −1
                                    </button>

                                    <!-- Падзяка таму, хто заўважыў праблему. Ад мадэратара
                                         яна важыць больш за звычайную ўхвалу — дзве зорачкі
                                         замест адной, — таму стаіць асобна ад лічбаў.
                                         Сабе падзякаваць нельга: кнопкі проста няма. -->
                                    <button
                                        class="moderation-praise"
                                        :class="{
                                            'moderation-praise--on': c.praised,
                                            'moderation-praise--named': item.complaints.length === 1,
                                        }"
                                        type="button"
                                        v-if="c.by !== ME"
                                        :title="
                                            c.praised
                                                ? 'Націснуць яшчэ раз — зняць падзяку'
                                                : 'Падзякаваць — гэта дзве зорачкі'
                                        "
                                        @click="praise(c)"
                                    >
                                        <IconMedal class="moderation-praise_icon" />
                                        <!-- Пры адной скарзе месца хапае, і слова дапамагае: значок
                                             медаля нячасты, з першага разу не здагадаешся. А калі
                                             скаргаў тры, тры «Падзякаваць» у слупок — гэта ўжо шум,
                                             і там хапае аднаго значка. -->
                                        <template v-if="item.complaints.length === 1">Падзякаваць</template>
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Слова. Кожны кавалак правіцца націскам па ім самім: тэкст
                     застаецца на месцы і не ператвараецца ў чужую форму. -->
                <div class="moderation-word" :class="{ 'moderation-word--dirty': isDirty(item) }">
                    <p class="moderation-hidden-mark" v-if="item.hidden">прыбранае з сайта</p>

                    <!-- «Арыгінал» стаіць уверсе самога слова, з правага краю, і
                         з'яўляецца толькі калі ў ім нешта змянілі. Унізе, у
                         радку рашэнняў, яна замінала: там два рашэнні па слове,
                         а гэта не рашэнне, а выхад з праўкі. -->
                    <button
                        class="moderation-discard"
                        type="button"
                        v-if="isDirty(item)"
                        title="Скасаваць праўкі"
                        aria-label="Скасаваць праўкі"
                        @click="discardEdits"
                    >
                        <IconUndo class="moderation-discard_icon" />
                    </button>

                    <!-- назва -->
                    <el-input
                        v-if="isOpen(item, 'term')"
                        v-model="draft.term"
                        class="moderation-f-term"
                        @blur="closeIfUntouched(item, 'term')"
                        @keydown.esc="revertField(item, 'term')"
                    />
                    <span
                        v-else
                        class="card-title moderation-editable"
                        role="button"
                        tabindex="0"
                        title="націсні, каб выправіць"
                        @click="openField(item, 'term', $event)"
                        @keydown.enter="openField(item, 'term')"
                        >{{ shown(item, 'term') }}</span
                    >

                    <span class="moderation-card-num" v-if="item.term_definitions > 1">
                        у гэтага слова яшчэ {{ item.term_definitions - 1 }}
                        {{ item.term_definitions - 1 === 1 ? 'картка' : 'карткі' }} — правіцца толькі гэтая
                    </span>

                    <!-- тлумачэнне -->
                    <el-input
                        v-if="isOpen(item, 'content')"
                        v-model="draft.content"
                        class="moderation-f-content"
                        type="textarea"
                        :autosize="{ minRows: 1 }"
                        @blur="closeIfUntouched(item, 'content')"
                        @keydown.esc="revertField(item, 'content')"
                    />
                    <p
                        v-else
                        class="card-description moderation-editable"
                        role="button"
                        tabindex="0"
                        title="націсні, каб выправіць"
                        @click="openField(item, 'content', $event)"
                        @keydown.enter="openField(item, 'content')"
                    >
                        {{ shown(item, 'content') }}
                    </p>

                    <!-- прыклад: калі яго няма, даём месца, каб дапісаць -->
                    <el-input
                        v-if="isOpen(item, 'example')"
                        v-model="draft.example"
                        class="moderation-f-example"
                        type="textarea"
                        :autosize="{ minRows: 1 }"
                        @blur="closeIfUntouched(item, 'example')"
                        @keydown.esc="revertField(item, 'example')"
                    />
                    <p
                        v-else
                        class="card-example moderation-editable"
                        :class="{ 'moderation-editable--empty': !item.example }"
                        role="button"
                        tabindex="0"
                        title="націсні, каб выправіць"
                        @click="openField(item, 'example', $event)"
                        @keydown.enter="openField(item, 'example')"
                    >
                        {{ shown(item, 'example') || 'прыкладу няма' }}
                    </p>

                    <!-- Тэгі правяцца на месцы, у самой пілюлі: націснуў на слова —
                         курсор стаў туды, дзе тыцнуў, пішаш, Enter захоўвае.
                         Пілюля нікуды не пераязджае і ў поле не ператвараецца.
                         Крыжык выдаляе. Націск па вольным месцы — новы тэг. -->
                    <div>
                        <div
                            class="add-word__tags-input-wrapper moderation-tags-edit moderation-f-tags"
                            @click="focusTagInput($event)"
                        >
                            <el-tag
                                v-for="(tag, index) in tagsOf(item)"
                                :key="index"
                                size="large"
                                class="add-word__tags-input-tag"
                                closable
                                :disable-transitions="false"
                                @close="removeTagAt(item, index)"
                            >
                                <span
                                    class="add-word__tags-input-tag-text"
                                    contenteditable="true"
                                    spellcheck="false"
                                    @click.stop
                                    @focus="beginEdit(item)"
                                    @keydown.enter.prevent="$event.target.blur()"
                                    @keydown.esc.prevent="resetTagText(item, index, $event)"
                                    @blur="commitTag(item, index, $event)"
                                    >{{ tag }}</span
                                >
                            </el-tag>

                            <el-input
                                v-model="newTag"
                                class="add-word__tags-input"
                                :placeholder="tagsOf(item).length ? '' : 'надрукуй тэг і націсні Enter'"
                                @focus="beginEdit(item)"
                                @keydown.enter.prevent="addTagTo(item)"
                                @keydown.delete="onTagBackspace"
                                @blur="addTagTo(item)"
                            />
                        </div>
                        <p v-if="tagNotice && editing === item.id" class="tags-notice">{{ tagNotice }}</p>
                    </div>
                </div>

                <!-- Аўтар і яго гісторыя. Лічбы патрэбныя, каб не банілі за адзін
                     скаргу таго, у каго сорак добрых слоў. Відаць заўсёды, і ў
                     праўцы таксама: хаваць яго не было прычыны, а картка ад
                     гэтага скакала ў вышыні. -->
                <div class="moderation-author" :class="{ 'moderation-author--flagged': isFlagged(item.author) }">
                    <div class="moderation-author_who">
                        <span class="moderation-author_line">
                            <!-- подпіс перад імем, як «скарга ад:» вышэй: на картцы
                                 два чалавекі, і без подпісу незразумела, хто з іх
                                 хто -->
                            <span class="moderation-author_label">аўтар слова:</span>
                            <IconStar
                                class="badge"
                                v-for="n of starsOf(item.author)"
                                :key="n"
                                :title="scoreHint(item.author)"
                            />
                            <button
                                class="moderation-author_name"
                                type="button"
                                :title="'Паказаць усе словы ад ' + item.author.name + ' на мадэрацыі'"
                                @click="personFilter = { kind: 'author', name: item.author.name }"
                            >
                                {{ item.author.name }}
                            </button>
                        </span>

                        <span class="moderation-author_stats">
                            залітых слоў {{ item.author.words }} · забаненых
                            <span :class="{ 'moderation-author_bad': isFlagged(item.author) }">{{
                                item.author.removed
                            }}</span>
                        </span>
                        <span class="moderation-author_banned" v-if="item.author.banned">
                            <template v-if="item.author.bannedUntil">
                                забанены да {{ formatLongDate(item.author.bannedUntil) }}
                            </template>
                            <template v-else>забанены</template>
                            — новыя словы дадаваць не можа
                        </span>
                    </div>

                    <!-- Бан — з правага краю радка з імем, а не ў радку рашэнняў
                         унізе: ён пра чалавека, а не пра слова, і стаіць там,
                         дзе лічбы, якія яго апраўдваюць. Ціхі, без рамкі і фону:
                         спатрэбіцца рэдка, і крычаць яму няма чаго. -->
                    <button
                        v-if="!showHistory"
                        class="moderation-ban"
                        :class="{ 'moderation-ban--on': item.author.banned }"
                        type="button"
                        @click="item.author.banned ? unban(item) : askBan(item)"
                    >
                        <IconSkull class="moderation-ban_icon" />
                        {{ item.author.banned ? 'Зняць бан' : 'Забаніць аўтара' }}
                    </button>
                </div>

                <!-- Рашэнне па запыце — у самым нізе карткі, пасля ўсяго, што
                     трэба прачытаць: скаргі, слова і аўтара. Два вынікі, а не
                     тры: слова або жыве, або не. «Гатова» — правіў ты яго ці не,
                     яно ідзе назад на сайт. «Выдаліць» — знікае з сайта, але
                     застаецца ў базе, каб было што паказаць, калі рашэнне
                     пачнуць аспрэчваць. -->
                <!-- у гісторыі замест кнопак — чым скончылася -->
                <p class="moderation-outcome" v-if="showHistory">{{ item.outcome }}</p>

                <div class="moderation-actions" v-else>
                    <span class="moderation-hint" v-if="item.hidden">«Гатова» верне слова на сайт</span>

                    <div class="moderation-actions_pair">
                        <button class="moderation-btn moderation-btn--fix" type="button" @click="save(item)">
                            Гатова
                        </button>
                        <button
                            class="moderation-btn moderation-btn--pink"
                            type="button"
                            v-if="!item.hidden"
                            @click="hide(item)"
                        >
                            Выдаліць слова
                            <IconCross class="moderation-btn_icon" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Хто ў бане: імя, за што і да якой даты. Той жа выгляд, што ў гісторыі —
             гэта таксама спіс ужо прынятых рашэнняў, якія можна перадумаць. -->
        <div class="moderation-recent" v-else-if="view === 'bans'">
            <p class="moderation-recent_head">Хто ў бане</p>

            <p class="note" v-if="!bans.length">Нікога ў бане няма.</p>

            <p class="moderation-recent_row" v-for="ban of bans" :key="ban.name">
                <span class="moderation-recent_term">{{ ban.name }}</span>
                <span class="moderation-recent_what">{{ ban.reason }}</span>
                <span class="moderation-recent_num">да {{ formatLongDate(ban.until) }}</span>
                <button class="moderation-recent_undo" type="button" @click="liftBan(ban)">адмяніць</button>
            </p>
        </div>

        <!-- Гісторыя — тыя ж радкі, што і ў паласе адмены ўнізе: слова, нумар,
             што з ім сталася і магчымасць перадумаць. -->
        <template v-else>
            <div class="moderation-day" v-for="group of historyDays" :key="group.day">
                <p class="moderation-day_head">{{ dayLabel(group.day) }}</p>

                <div class="moderation-recent">
                    <p class="moderation-recent_row" v-for="item of group.items" :key="item.id">
                        <span class="moderation-recent_term">{{ item.term }}</span>
                        <span class="moderation-recent_num">№{{ item.id }}</span>
                        <span class="moderation-recent_what" :class="{ 'moderation-recent_what--gone': item.hidden }">{{
                            item.outcome
                        }}</span>
                        <button class="moderation-recent_undo" type="button" @click="reopen(item)">адмяніць</button>
                    </p>
                </div>
            </div>
        </template>

        <!-- Тая ж пагінацыя, што на галоўнай і ў «Маіх словах»: чалавек не мусіць
             вучыцца новаму спосабу гартання дзеля адной старонкі. -->
        <div class="pages-list" v-if="view !== 'bans' && list.length > PER_PAGE">
            <el-pagination
                :background="true"
                :current-page="page"
                @update:current-page="onPageChange"
                :page-size="PER_PAGE"
                :pager-count="4"
                layout="prev, pager, next"
                :total="list.length"
            />
        </div>

        <!-- Дзякуем толькі таму, хто сапраўды разабраў порцыю. Калі чалавек
             адкрыў старонку і скаргаў там ужо не было, хваліць яго няма за
             што — тады проста кажам, што работы няма. -->
        <!-- Пакуль скаргі едуць з базы, старонка маўчыць пра тое, колькі іх.
             Сказаць «скаргаў няма» да адказу базы — значыць сказаць няпраўду,
             а потым забраць свае словы назад. -->
        <p class="note" v-if="loading">Загружаем скаргі…</p>
        <p class="note" v-else-if="loadError">Скаргі не загрузіліся. Паспрабуй абнавіць старонку.</p>
        <p class="note note--done" v-else-if="view === 'queue' && !list.length && batchTotal">
            Дзякуй за працу! Ты — цуд!
        </p>
        <p class="note" v-else-if="view === 'queue' && !list.length">Скаргаў няма.</p>

        <!-- Разгледжанае за тыдзень застаецца ўнізе. Не дзеля справаздачы:
             мадэратар часта заўважае памылку праз хвіліну пасля таго, як
             націснуў, і без гэтай паласы яму давялося б шукаць слова праз
             пошук па сайце. Тэрмін стаіць у самім загалоўку — асобнага
             сказа пра тое, калі радкі знікнуць, не трэба. -->
        <div class="moderation-recent" v-if="view === 'queue' && justDone.length">
            <p class="moderation-recent_head">Толькі што разгледжана</p>

            <p class="moderation-recent_row" v-for="item of justDone" :key="item.id">
                <span class="moderation-recent_term">{{ item.term }}</span>
                <span class="moderation-recent_num">№{{ item.id }}</span>
                <span class="moderation-recent_what" :class="{ 'moderation-recent_what--gone': item.hidden }">{{
                    item.outcome
                }}</span>
                <button class="moderation-recent_undo" type="button" @click="reopen(item)">адмяніць</button>
            </p>
        </div>

        <!-- Бан заўсёды на тэрмін: назаўсёды забараніць чалавеку пісаць нельга.
             Тэрмін выбіраецца тут жа, таму асобнай кнопкі «забаніць» у акне
             няма — сам выбар тэрміну і ёсць пацвярджэнне. -->
        <!-- custom-class, а не class: у Element Plus 2.2.9 звычайны class да
             самога акна не даходзіць, і стылі моўчкі не дзейнічаюць -->
        <el-dialog v-model="banDialog" width="30rem" align-center custom-class="ban-dialog">
            <!-- Без «ты жадаеш»: пытанне і так звернутае да таго, хто чытае,
                 і займеннік нічога не дадае. Заадно знікае і выбар паміж «ты»
                 і «вы» — тут ужо няма чаму быць не на сваім месцы. -->
            <p class="ban-dialog_q">Забаніць {{ banRole }} @{{ banTarget ? banTarget.name : '' }}?</p>
            <!-- Пра словы і скаргі разам: бан адзін на ўсё, і акно адкрываецца як
                 з карткі аўтара, так і са спісу таго, хто скардзіцца. -->
            <p class="ban-dialog_note">
                Бан часовы — чалавек не зможа дадаваць новыя словы і скардзіцца, але ўжо напісанае застанецца. Выберы,
                на які тэрмін.
            </p>

            <!-- Такія ж кружкі, як у прычын ніжэй. Раней тут былі высокія радкі з
                 рыскамі — на тэлефоне яны з’ядалі паўэкрана, і акно не было відаць
                 цалкам. Дата перанесена ў той жа радок, шэрым: яна ўдакладняе
                 тэрмін, а не спаборнічае з ім. -->
            <el-radio-group v-model="chosenTerm" class="ban-dialog_reasons ban-dialog_terms-list">
                <el-radio v-for="term of BAN_TERMS" :key="term.days" :label="term.days">
                    {{ term.label }}
                    <span class="ban-dialog_until">да {{ untilLabel(term.days) }}</span>
                </el-radio>
            </el-radio-group>

            <!-- Чалавек мусіць ведаць, за што: інакш выправіцца немагчыма, і бан
                 з меры ператвараецца ў пакаранне без тлумачэння. Прычына і словы
                 ніжэй — не для архіва, іх убачыць ён сам. -->
            <p class="ban-dialog_note ban-dialog_note--why">Прычына:</p>

            <!-- Звычайныя кружкі, тыя ж, што на старонцы скаргі: спіс тэрмінаў
                 вышэй зроблены радкамі з датамі, і яму гэта патрэбна, а тут
                 проста пяць кароткіх слоў — і чатыры радкі высокіх кнопак з
                 рыскамі забіралі паўакна ні за што. -->
            <el-radio-group v-model="banReason" class="ban-dialog_reasons">
                <el-radio v-for="reason of banReasons" :key="reason.id" :label="reason.id">{{ reason.label }}</el-radio>
            </el-radio-group>

            <!-- Падрабязнасці неабавязковыя, але чалавек убачыць іх разам з
                 прычынай: адно слова кажа, ЧАМУ, а гэты радок — што менавіта
                 было не так. -->
            <el-input
                v-model="banComment"
                class="ban-dialog_comment"
                type="textarea"
                :autosize="{ minRows: 2 }"
                placeholder="Можна дапісаць падрабязнасці"
            />

            <!-- Выбар і пацвярджэнне падзеленыя: націск па тэрміне толькі
                 адзначае яго, забаняе ўжо «Гатова». Перадумаць — крыжыкам
                 зверху, таму асобнай «Адмены» тут няма. -->
            <template #footer>
                <!-- «Забаніць», а не «Гатова»: на картцы «Гатова» значыць
                     «слова вяртаецца на сайт», і тая ж кнопка з процілеглым
                     сэнсам блытала б. Ружовая, як усё, што нешта прыбірае. -->
                <button
                    class="moderation-btn moderation-btn--pink"
                    type="button"
                    :disabled="!canBan"
                    @click="ban(BAN_TERMS.find((t) => t.days === chosenTerm))"
                >
                    <IconSkull class="moderation-btn_icon" />
                    Забаніць {{ banRole }}
                </button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { formatLongDate } from './date.js';
import { getUser } from './auth.js';
import { loadModeration } from './moderation-data.js';
import IconSkull from './icons/IconSkull.vue';
import IconHistory from './icons/IconHistory.vue';
import IconSauna from './icons/IconSauna.vue';
import IconCross from './icons/IconCross.vue';
import IconStar from './icons/IconStar.vue';
import IconUndo from './icons/IconUndo.vue';
import IconMedal from './icons/IconMedal.vue';

// Значкі. Іх наўмысна мала: на маленькай суполцы дзясятак значкоў выглядае
// закінутым, а тры — жывымі. Кожны стаіць за рэальную працу, а не за
// прысутнасць на сайце.
// ── Балы і зорачкі ─────────────────────────────────────────────────────────
// Балы даюцца толькі за зробленае, і не адымаюцца за памылкі: чалавек не
// страціць рэйтынг за тое, што нешта паправілі. Мінус ідзе адзін —
// за слова, якое давялося прыбраць з сайта.
//
//   +1  за кожнае дададзенае слова
//   +1  за слова, якое добра палайкалі іншыя
//   +1  за кожную ўхваленую скаргу
//   −1  за слова, прыбранае з сайта
//
// Зорачкі: 15 балаў — адна, 50 — дзве, 100 — тры.
// «1 раз», «2 разы», «5 разоў» — лічым як у мове, а не «раз(оў)»
function timesLabel(n) {
    const ten = n % 10;
    const hundred = n % 100;
    let word = 'разоў';

    if (ten === 1 && hundred !== 11) {
        word = 'раз';
    } else if (ten >= 2 && ten <= 4 && !(hundred >= 12 && hundred <= 14)) {
        word = 'разы';
    }

    return `${n} ${word} скарга была не па справе`;
}

const STAR_STEPS = [100, 50, 15];

function scoreOf(person) {
    if (!person) {
        return 0;
    }

    // падзяка мадэратара важыць дзве зорачкі — таму ўдвая
    return (
        (person.words || 0) +
        (person.liked || 0) +
        (person.approved || 0) +
        (person.praised || 0) * 2 -
        (person.removed || 0)
    );
}

function starsOf(person) {
    const score = scoreOf(person);
    const step = STAR_STEPS.findIndex((min) => score >= min);
    return step === -1 ? 0 : STAR_STEPS.length - step;
}

// «1 бал», «24 балы», «100 балаў»
function scoreWord(n) {
    const ten = n % 10;
    const hundred = n % 100;

    if (ten === 1 && hundred !== 11) {
        return 'бал';
    }

    if (ten >= 2 && ten <= 4 && !(hundred >= 12 && hundred <= 14)) {
        return 'балы';
    }

    return 'балаў';
}

const scoreHint = (person) => scoreOf(person) + ' ' + scoreWord(scoreOf(person));

const REASONS = {
    'unclear-term': 'унутраны жарт ці не рэальны тэрмін',
    'personal-data': 'асабістыя дадзеныя',
    'hostile-language': 'мова варожасці',
    'fix-mistake': 'памылка ў тэксце',
    other: 'іншае',
};

// Чарга прыходзіць з базы: усе скаргі, згрупаваныя па словах — картка тут
// адна на слова, а не на скаргу. Пакуль не загрузілася, спіс пусты, і
// старонка не мае права сказаць «скаргаў няма»: гэта вырашае `loading`.
const items = ref([]);
const loading = ref(true);
const loadError = ref(false);

const open = computed(() => items.value.filter((i) => !i.resolved));
// Парадак разбору, каб «Толькі што разгледжана» сапраўды паказвала апошняе, а
// не тое, што выпадкова стаіць першым у зыходным спісе.
let resolveSeq = 0;

const done = computed(() =>
    items.value
        .filter((i) => i.resolved && withinKeep(i))
        // Спярша тое, што разабралі толькі што, потым астатняе — днямі зверху
        // ўніз. Без другога правіла карткі з базы ляглі б у парадку скаргаў,
        // гэта значыць самае старое ўверсе, і гісторыя чыталася б задам наперад.
        .sort(
            (a, b) =>
                (b.seq || 0) - (a.seq || 0) || String(b.resolvedAt || '').localeCompare(String(a.resolvedAt || ''))
        )
);

// гісторыя — тыя ж карткі, толькі ўжо разгледжаныя
// Тры выгляды адной старонкі: чарга скаргаў, гісторыя разгледжанага і спіс
// банаў. Раней быў сцяжок «гісторыя ці не» — з трэцім выглядам ён ужо не
// апісвае, што паказваецца.
const view = ref('queue');

const showHistory = computed(() => view.value === 'history');

// Адбор па тым, хто напісаў скаргу: націск на імя пакідае ў спісе толькі яго
// скаргі. Зручна, калі трэба паглядзець, ці не носіць чалавек аднолькавае
// сумніўнае — ці, наадварот, ці ўсе яго скаргі слушныя.
// Хто зараз разбірае скаргі. Патрэбна, каб мадэратар не мог падзякаваць
// самому сабе: у жывым выглядзе тут будзе яго ўліковы запіс.
const ME = ref('');

// Паўторны націск здымае падзяку: кнопка ціхая і стаіць побач з лічбамі,
// трапіць у яе выпадкова лёгка, і выхад з гэтага мусіць быць такі ж просты,
// як уваход.
// «Не па справе» і падзяка выключаюць адна адну: нельга адначасова сказаць
// «дзякуй» і «міма».
function dismiss(complaint) {
    complaint.dismissed = !complaint.dismissed;

    if (!complaint.dismissed) {
        ElMessage.info(`Бал вернуты: ${complaint.by}`);
        return;
    }

    complaint.praised = false;
    ElMessage.info(`${complaint.by} — бал за гэтую скаргу не залічыцца`);
}

function praise(complaint) {
    complaint.praised = !complaint.praised;

    if (complaint.praised) {
        complaint.dismissed = false;
    }

    if (complaint.by_person) {
        complaint.by_person.praised = (complaint.by_person.praised || 0) + (complaint.praised ? 1 : -1);
    }

    if (!complaint.praised) {
        ElMessage.info('Падзяка знятая');
        return;
    }

    ElMessage.success(`Дзякуй, ${complaint.by}! — дзве зорачкі`);
}

// Адбор па чалавеку — або па тым, хто паскардзіўся, або па аўтары слова.
// Адзін стан на два віды наўмысна: калі б яны ўключаліся разам, з шапкі было б
// не зразумець, чый гэта спіс і чаму ў ім засталася адна картка.
const personFilter = ref(null);

const filterLabel = computed(() => {
    if (!personFilter.value) {
        return '';
    }

    const { kind, name } = personFilter.value;

    return kind === 'author' ? `словы ад: ${name}` : `скаргі ад: ${name}`;
});

// Малюем чаргу стосам, а не ўсю адразу: калі нехта заліў сотню слоў, сотня
// картак з палямі праўкі і дыялогамі — гэта ўжо адчувальная вага для браўзера.
// Тут 3 дзеля таго, каб стрэлкі было відаць на чатырох тэставых картках; на
// баявой старонцы стане 20 — мяняецца адной лічбай.
const PER_PAGE = 3;
const page = ref(1);

const list = computed(() => {
    const base = showHistory.value ? done.value : open.value;
    const chosen = personFilter.value;

    if (!chosen) {
        return base;
    }

    return chosen.kind === 'author'
        ? base.filter((i) => i.author?.name === chosen.name)
        : base.filter((i) => i.complaints.some((c) => c.by === chosen.name));
});

// Паласа ўнізе — не справаздача, а магчымасць перадумаць: памылку заўважаюць
// праз хвіліну пасля націску, а не праз паўгадзіны. Таму тут толькі апошняе,
// а ўвесь тыдзень жыве ў «гісторыі», куды ідуць знарок.
const justDone = computed(() => done.value.slice(0, 3));

// Колькі жыве гісторыя. Адна лічба на дзве рэчы: столькі ж часу рашэнне можна
// і адмяніць. Два розныя тэрміны прыйшлося б тлумачыць — «радок бачны, а кнопкі
// пры ім няма» чытаецца як паломка. Тут правіла адно: што бачыш, тое і вернеш.
const KEEP_DAYS = 30;

function withinKeep(item) {
    if (!item.resolvedAt) {
        return true;
    }

    return (new Date(today()) - new Date(item.resolvedAt)) / 86400000 <= KEEP_DAYS;
}

// Дзень у выглядзе «2026-08-26»: па ім і групуем, бо ён адзін і той жа для ўсіх
// картак аднаго дня і сартуецца сам сабою, без разбору дат.
function today() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Толькі дата, без «сёння» і «ўчора»: у спісе, дзе дні ідуць адзін за адным,
// слова збівае рытм — вока чапляецца за яго і губляе, дзе тут парадак.
// Год не пішам: гісторыя жыве тыдзень, і памяняцца ён не паспее.
function dayLabel(day) {
    // Адразаем год ад гатовай даты, а не просім Intl абысціся без яго:
    // браўзер аддае лакаль то як «be-BY», то як «be», і праверка на дакладнае
    // супадзенне моўчкі вяла ў запасны шлях, дзе год вяртаўся назад.
    return formatLongDate(day).split(' ').slice(0, 2).join(' ');
}

// Гісторыя ідзе днямі: белая дата, пад ёй картка са словамі за гэты дзень.
// Групуем ужо адабраную старонку, а не ўвесь спіс, — інакш гартанне і дні
// пачалі б спрачацца, хто з іх галоўны.
const historyDays = computed(() => {
    const days = [];

    for (const item of pageItems.value) {
        const day = item.resolvedAt || 'даўней';
        const last = days[days.length - 1];

        if (last && last.day === day) {
            last.items.push(item);
        } else {
            days.push({ day, items: [item] });
        }
    }

    return days;
});

// Лічбы таго, чые скаргі зараз адабраныя. Бяром з першай жа ягонай скаргі:
// статыстыка ў іх адна на чалавека, а не на скаргу.
const filterPerson = computed(() => {
    if (personFilter.value?.kind !== 'by') {
        return null;
    }

    for (const row of items.value) {
        const found = row.complaints?.find((c) => c.by === personFilter.value.name);

        if (found?.by_stats) {
            return { name: found.by, stats: found.by_stats, person: found.by_person };
        }
    }

    return null;
});

const pageCount = computed(() => Math.max(1, Math.ceil(list.value.length / PER_PAGE)));
const pageItems = computed(() => list.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE));

function onPageChange(next) {
    page.value = next;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Чарга змяншаецца, пакуль па ёй ходзяць. Разабрала апошнюю картку на апошняй
// старонцы — старонкі больш няма, і без гэтага чалавек застаўся б глядзець на
// пустое месца, не разумеючы, куды ўсё дзелася.
watch(pageCount, (count) => {
    if (page.value > count) {
        page.value = count;
    }
});

// Перайшлі ў гісторыю ці адабралі аднаго чалавека — гэта ўжо іншы спіс,
// і пачынаць яго трэба спачатку, а не з трэцяй старонкі папярэдняга.
watch([view, personFilter], () => (page.value = 1));

// Колькі зроблена сёння. Пачатковыя лічбы бяром з базы — з таго, што ўжо
// закрыта сённяшняй датай, — і далей дадаём да іх свае рашэнні.
const stats = reactive({ fixed: 0, removed: 0 });

// «апрацавана» — і выпраўленае, і выдаленае: для мадэратара гэта адна праца,
// а не два розныя вынікі
// Порцыя на сёння замацоўваецца пры адкрыцці старонкі і больш не расце.
// Гэта галоўнае ў лічыльніку: скаргі прыходзяць увесь час, і калі лічыць іх
// усе, лік «засталося» павялічваецца пад рукамі — разабраў дваццаць, а
// засталося больш, чым было. Тое, што прыйдзе пасля, трапіць у наступную
// порцыю, а гэтая заўсёды даходзіць да канца.
const batchTotal = ref(0);

// Кнопка «пачастуй кавай» ад Buy Me a Coffee прыбітая да правага ніжняга кута
// з z-index 9999 і на тэлефоне лягла акурат на «Выдаліць». Тут яна і без таго
// не да месца — мадэратар прыйшоў працаваць, а не ахвяраваць, — таму на час
// гэтай старонкі хаваем. Клас на body, бо сам віджэт жыве па-за нашым дрэвам.
onMounted(async () => {
    document.body.classList.add('is-moderating');

    // Імя патрэбна, каб мадэратар не мог падзякаваць самому сабе за ўласную
    // скаргу. Профіль сайта трымае імя ў `username`.
    const account = await getUser();

    ME.value = account?.user_metadata?.username || account?.user_metadata?.name || '';

    try {
        const { cards } = await loadModeration();

        items.value = cards;
    } catch (error) {
        // Прычын дзве: скаргі не чытаюцца (правы) ці сетка не адказала. Для
        // таго, хто адкрыў старонку, гэта адно і тое ж — «зараз не выйшла», —
        // таму адно паведамленне на абодва выпадкі, а падрабязнасці ў кансоль.
        console.error(error);
        loadError.value = true;
    } finally {
        loading.value = false;
    }

    // Сённяшнія рашэнні, зробленыя да гэтага адкрыцця старонкі: без іх
    // лічыльнік паказваў бы «апрацавана: 0» пасля перазагрузкі пасярод працы.
    for (const item of items.value) {
        if (item.resolvedAt !== today()) {
            continue;
        }

        if (item.outcome === 'выдалена з сайта') {
            stats.removed += 1;
        } else {
            stats.fixed += 1;
        }
    }

    batchTotal.value = open.value.length + stats.fixed + stats.removed;
});
onUnmounted(() => document.body.classList.remove('is-moderating'));

// Якая картка ў праўцы і якія яе кавалкі ўжо адкрытыя. Кавалкі адкрываюцца
// паасобку: выправіць адно слова ў тлумачэнні — самая частая скарга, і дзеля
// яго не варта разгортваць усю картку ў форму.
const editing = ref(null);
// звычайны спіс, а не Set: за Set у ref Vue сочыць інакш, і адкрыццё аднаго
// поля разгортвала ўсе чатыры
const openFields = ref([]);
const draft = reactive({ term: '', content: '', example: '', tags: [] });

const isOpen = (item, field) => editing.value === item.id && openFields.value.includes(field);

// Адкрывае адзін кавалак карткі на праўку. event патрэбны, каб паставіць
// курсор туды, куды трапіла мыш ці палец, а не ў пачатак радка.
function openField(item, field, event) {
    // у гісторыі карткі толькі чытаюцца: скарга ўжо закрытая
    if (showHistory.value) {
        return;
    }

    const card = event && event.target.closest ? event.target.closest('.moderation-card') : null;
    const offset = caretOffsetFrom(event);

    beginEdit(item);

    if (!openFields.value.includes(field)) {
        openFields.value = [...openFields.value, field];
    }

    nextTick(() => placeCaret(card, field, offset));
}

// Пераводзіць картку ў праўку і здымае з яе копію тэксту, з якой працуем.
// Пакуль не націснута «Захаваць», сам запіс не мяняецца.
function beginEdit(item) {
    if (editing.value === item.id) {
        return;
    }
    editing.value = item.id;
    openFields.value = [];
    newTag.value = '';
    tagNotice.value = '';
    draft.term = item.term;
    draft.content = item.content;
    draft.example = item.example;
    draft.tags = [...item.tags];
}

// Тэгі відаць з крыжыкамі заўсёды: радок і ёсць свой уласны рэдактар.
const tagsOf = (item) => (editing.value === item.id ? draft.tags : item.tags);

// Дзе ў тэксце стаяў націск. Браўзеры завуць гэта па-рознаму, таму спрабуем
// абодва спосабы; калі не выйшла — вернем null, і курсор стане ў канец.
function caretOffsetFrom(event) {
    if (!event || event.clientX == null) {
        return null;
    }

    let node = null;
    let offset = null;

    if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (range) {
            node = range.startContainer;
            offset = range.startOffset;
        }
    } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(event.clientX, event.clientY);
        if (pos) {
            node = pos.offsetNode;
            offset = pos.offset;
        }
    }

    if (offset === null || !node || node.nodeType !== Node.TEXT_NODE) {
        return null;
    }

    // у разметцы тэкст стаіць з водступамі, таму ў вузле ёсць лішнія прабелы
    // і пераносы перад ім — іх трэба зняць з ліку
    const raw = node.textContent || '';
    return Math.max(0, offset - (raw.length - raw.trimStart().length));
}

function placeCaret(card, field, offset) {
    const box = card && card.querySelector('.moderation-f-' + field);
    const el = box && box.querySelector('textarea, input');

    if (!el) {
        return;
    }

    el.focus();
    const pos = offset === null ? el.value.length : Math.min(offset, el.value.length);
    el.setSelectionRange(pos, pos);
}

const sameTags = (a, b) => a.length === b.length && a.every((t, i) => t === b[i]);

// Ці адрозніваецца тое, што ў чарнавіку, ад таго, што ў картцы. Чарнавік у нас
// адзін на ўсю старонку, таму спярша правяраем, што правяць менавіта гэтую
// картку — інакш чужыя праўкі лічыліся б яе ўласнымі.
function isDirty(item) {
    if (editing.value !== item.id) {
        return false;
    }

    return (
        draft.term !== item.term ||
        draft.content !== item.content ||
        draft.example !== item.example ||
        !sameTags(draft.tags, item.tags)
    );
}

// Escape вяртае поле да таго, што ў картцы, і згортвае яго назад у тэкст.
// Гэта замена кнопцы «Адмена», якой больш няма.
function revertField(item, field) {
    if (editing.value !== item.id) {
        return;
    }

    if (field === 'tags') {
        draft.tags = [...item.tags];
        newTag.value = '';
        tagNotice.value = '';
    } else {
        draft[field] = item[field];
    }

    closeIfUntouched(item, field);
}

// Што паказваць у картцы: пакуль яе правяць — чарнавік, інакш — само слова.
// Дзякуючы гэтаму поле можна зачыняць адразу, як курсор сышоў: праўка
// застаецца відаць тэкстам і не губляецца.
const shown = (item, field) => (editing.value === item.id ? draft[field] : item[field]);

// Адвёў мышку ці палец — поле зачыняецца заўсёды. Раней кранутае поле
// заставалася шэрым да самага «Гатова», і карткай было немагчыма карыстацца:
// шэрымі рабіліся ўсе палі, якіх ты дакранулася.
function closeIfUntouched(item, field) {
    if (editing.value !== item.id) {
        return;
    }

    openFields.value = openFields.value.filter((f) => f !== field);

    // нічога не змянялі — выходзім з праўкі зусім, каб вярнуліся звычайныя
    // кнопкі карткі
    if (!openFields.value.length && !isDirty(item)) {
        cancel();
    }
}

// Скідае праўкі, якія яшчэ нікуды не запісаныя. Само слова не чапаем: чарнавік
// жыве асобна ад карткі і трапляе ў яе толькі па «Гатова».
function discardEdits() {
    cancel();
    ElMessage.info('Праўкі скасаваныя');
}

function cancel() {
    editing.value = null;
    /* спіс, а не Set: адкрытыя палі перабіраюцца праз includes і filter */
    openFields.value = [];
    newTag.value = '';
    tagNotice.value = '';
}

// ── Тэгі ────────────────────────────────────────────────────────────────────
// Тыя ж правілы, што ў форме дадавання слова: іначай мадэратар, правячы тэг,
// нарабіў бы ў базе якраз тых дублікатаў, якія мы адтуль вычышчалі.
const newTag = ref('');
const tagNotice = ref('');
let tagNoticeTimer = null;

function showTagNotice(text) {
    tagNotice.value = text;
    clearTimeout(tagNoticeTimer);
    tagNoticeTimer = setTimeout(() => (tagNotice.value = ''), 3000);
}

// Націск па вольным месцы радка ставіць курсор у поле новага тэга. Поле шукаем
// у самім радку, па якім тыцнулі: спасылка ref тут была б масівам на ўсе карткі.
function focusTagInput(event) {
    if (event.target.closest('.el-tag')) {
        return;
    }
    event.currentTarget.querySelector('input')?.focus();
}

// Праўка тэга на месцы: тэкст пілюлі — contenteditable, і пасля Enter ці
// адводу мышы мы бяром з яго тое, што там напісана.
function commitTag(item, index, event) {
    const el = event.target;
    const typed = el.textContent.trim().replace(/ +/g, ' ');
    const was = draft.tags[index];

    if (!typed) {
        removeTagAt(item, index);
        return;
    }

    const normalized = typed[0].toUpperCase() + typed.slice(1);

    if (normalized === was) {
        el.textContent = was;
        return;
    }

    const clash = draft.tags.find((t, i) => i !== index && t.toLowerCase() === normalized.toLowerCase());

    if (clash) {
        showTagNotice(`«${clash}» ужо ёсць`);
        el.textContent = was;
        return;
    }

    draft.tags[index] = normalized;
}

// Escape вяртае пілюлі ранейшы тэкст
function resetTagText(item, index, event) {
    event.target.textContent = draft.tags[index] ?? item.tags[index];
    event.target.blur();
}

function removeTagAt(item, index) {
    beginEdit(item);
    draft.tags.splice(index, 1);
}

// Пачатак праўкі чысціць поле новага тэга — каб з адной карткі не пераехала
// недапісанае ў другую. Таму спярша забіраем надрукаванае, а вяртаем пасля.
function addTagTo(item) {
    const typed = newTag.value;

    beginEdit(item);
    newTag.value = typed;
    addTag();
}

// Backspace у пустым полі прыбірае апошні тэг — звычка з любога поля з пілюлямі
function onTagBackspace(event) {
    if (newTag.value.length || !draft.tags.length) {
        return;
    }
    event.preventDefault();
    draft.tags.pop();
}

function addTag() {
    // крайнія прабелы прэч, двайныя ўнутры сціскаем, першая літара вялікая —
    // усё, каб «школа», «Школа» і «школа » не сталі трыма рознымі тэгамі
    const trimmed = newTag.value.trim().replace(/ +/g, ' ');
    const normalized = trimmed && trimmed[0].toUpperCase() + trimmed.slice(1);

    if (!normalized) {
        return;
    }

    const already = draft.tags.find((t) => t.toLowerCase() === normalized.toLowerCase());

    if (already) {
        // называем тое напісанне, што ўжо стаіць, — інакш незразумела, чаму
        // «мова» не дадалася, калі ў картцы «Мова»
        showTagNotice(`«${already}» ужо ёсць`);
    } else {
        draft.tags.push(normalized);
    }

    newTag.value = '';
}

function save(item) {
    // Спярша пытаемся, ці было што зменена, і толькі потым пішам: калі
    // параўноўваць пасля запісу, картка ўжо роўная чарнавіку і адказ заўсёды
    // выходзіць «нічога не мянялі».
    const changed = isDirty(item);

    // Здымак таго, як слова выглядала да праўкі. Без яго «адмяніць» вяртала б
    // рашэнне, але не тэкст: мадэратар выправіў слова, націснуў «Гатова»,
    // перадумаў — і арыгінала ўжо нідзе няма. Скасаваць трэба ўсё дзеянне,
    // а не яго палову.
    item.before = {
        term: item.term,
        content: item.content,
        example: item.example,
        tags: [...item.tags],
    };

    // І пішам толькі тады, калі правілі менавіта гэтую картку. Чарнавік адзін
    // на ўсю старонку; без гэтай умовы «Гатова» на нечапанай картцы сцірала
    // слова пустымі радкамі з чарнавіка.
    if (editing.value === item.id) {
        item.term = draft.term.trim();
        item.content = draft.content.trim();
        item.example = draft.example.trim();
        item.tags = [...draft.tags];
    }

    // «Гатова» заўсёды вяртае слова на сайт — незалежна ад таго, правілі яго
    // ці проста прачыталі і вырашылі, што ўсё нармальна
    item.hidden = false;
    item.resolved = true;
    item.outcome = 'адпраўлена на сайт';
    item.seq = ++resolveSeq;
    item.resolvedAt = today();
    cancel();
    stats.fixed += 1;
    ElMessage.success(changed ? 'Выпраўлена, слова на сайце' : 'Слова засталося на сайце');
}

// Два іншыя рашэнні скідаюць пачатыя праўкі: слова або прыбіраецца, або
// застаецца як было. Прымяніць іх моўчкі было б непрыемным сюрпрызам.
// Выдаленне толькі з сайта: у базе слова застаецца, каб было што паказаць,
// калі рашэнне пачнуць аспрэчваць, і каб яго можна было вярнуць
// Вярнуць слова ў чаргу: рашэнне адмяняецца, картка становіцца як была.
// Слова, якое было прыбранае з сайта, вяртаецца на сайт разам з ім.
// «Адмяніць» скасоўвае толькі тое, што зрабіў мадэратар: слова вяртаецца ў
// чаргу поўнай карткай, з тым тэкстам, які быў да праўкі. Са скаргай і з самім
// словам у базе нічога не адбываецца.
function reopen(item) {
    if (item.before) {
        item.term = item.before.term;
        item.content = item.before.content;
        item.example = item.before.example;
        item.tags = [...item.before.tags];
        item.before = null;
    }

    item.resolved = false;
    item.outcome = null;
    item.seq = 0;
    item.resolvedAt = null;
    item.hidden = false;
    ElMessage.info('Слова вярнулася на мадэрацыю');
}

function hide(item) {
    cancel();
    item.hidden = true;
    item.resolved = true;
    item.outcome = 'выдалена з сайта';
    item.seq = ++resolveSeq;
    item.resolvedAt = today();
    stats.removed += 1;
    ElMessage.success('Слова выдаленае з сайта — у базе засталося');
}

// Каго варта разгледзець уважлівей: не проста «ёсць прыбраныя словы», а
// прыбраных шмат адносна ўсяго напісанага. Чалавек з 40 словамі і адным
// прыбраным — звычайны аўтар, а не парушальнік.
function isFlagged(author) {
    return author.removed >= 2 && author.removed / author.words >= 0.3;
}

// ── Бан на тэрмін ───────────────────────────────────────────────────────────
// Назаўсёды забараніць чалавеку пісаць нельга: людзі мяняюцца, а слоўнік
// піша супольнасць, а не мадэратары. Таму тэрмін абавязковы.
const BAN_TERMS = [
    { days: 1, label: 'дзень' },
    { days: 7, label: 'тыдзень' },
    { days: 14, label: 'два тыдні' },
    { days: 30, label: 'месяц' },
];

// дата, калі скончыцца бан такой працягласці — паказваем адразу пры выбары,
// каб не лічыць у галаве
function untilLabel(days) {
    const until = new Date();
    until.setDate(until.getDate() + days);
    return formatLongDate(until);
}

const banDialog = ref(false);
// Хто зараз у бане. У жывым выглядзе гэта будзе табліца ў базе; тут — спіс,
// каб старонку можна было паглядзець цалкам.
const bans = ref([]);

const banTarget = ref(null);
const banReason = ref('');
const banComment = ref('');

// Тры прычыны на абедзве ролі. Кожная зразумелая без тлумачэння і кожная
// адназначная: чалавек, які іх прачытае, ведае, што менавіта рабіў не так.
// «Іншага» тут няма наўмысна — бан па прычыне «іншае» не тлумачыць нічога.
//
// У кожнай два выгляды. Мадэратар выбірае з кароткіх назваў — у спісе
// патрэбна хуткае вока. А чалавеку прыходзіць сказ, і там тая ж прычына
// мусіць стаць у склон: «у бане за мову варожасці», а не «за мова».
const BAN_REASONS = [
    { id: 'hate', label: 'мова варожасці', phrase: 'за мову варожасці' },
    {
        id: 'personal',
        label: 'чужыя асабістыя дадзеныя',
        phrase: 'за выкарыстанне чужых асабістых дадзеных',
    },
    { id: 'spam', label: 'спам', phrase: 'за спам' },
    {
        id: 'rules',
        label: 'сістэматычнае парушэнне правілаў',
        phrase: 'за сістэматычнае парушэнне правілаў',
    },
];

const banReasons = BAN_REASONS;
// «Іншае» без словаў нічога не тлумачыць — тады каментар абавязковы.
// Тэрмін і прычына абавязковыя, падрабязнасці — не: тры прычыны і так
// гавораць самі за сябе, а дапісаць ёсць што не заўсёды.
const canBan = computed(() => Boolean(chosenTerm.value && banReason.value));

// Каго банім: аўтара слова ці таго, хто правіць чужыя. Слова тут не дзеля
// прыгажосці — акно адно на два розныя дзеянні, і памыліцца тут дорага.
const banRole = computed(() => (banTarget.value?.kind === 'author' ? 'аўтара' : 'рэдактара'));
// адзначаны, але яшчэ не пацверджаны тэрмін
const chosenTerm = ref(null);

// Бан аўтара слова: разам з ім картка закрываецца — слова сыходзіць з сайта
// разам з чалавекам.
function askBan(item) {
    banTarget.value = { kind: 'author', name: item.author.name, person: item.author, item };
    chosenTerm.value = null;
    banReason.value = '';
    banComment.value = '';
    banDialog.value = true;
}

// Бан таго, хто скардзіцца не па справе. Са словам не робіць нічога: слова ні ў
// чым не вінаватае, і разбіраць яго ўсё роўна давядзецца.
function askBanPerson(who) {
    banTarget.value = { kind: 'complainer', name: who.name, person: who.person, item: null };
    chosenTerm.value = null;
    banReason.value = '';
    banComment.value = '';
    banDialog.value = true;
}

function ban(term) {
    const target = banTarget.value;

    if (!target || !term) {
        return;
    }

    const until = new Date();
    until.setDate(until.getDate() + term.days);

    if (target.person) {
        target.person.banned = true;
        target.person.bannedUntil = until.toISOString();
        // тое, што чалавек убачыць замест формы
        target.person.banReason = BAN_REASONS.find((r) => r.id === banReason.value)?.phrase || '';
        target.person.banComment = banComment.value.trim();

        bans.value = [
            {
                name: target.name,
                until,
                reason: BAN_REASONS.find((r) => r.id === banReason.value)?.label || '',
                comment: banComment.value.trim(),
                person: target.person,
            },
            ...bans.value.filter((b) => b.name !== target.name),
        ];
    }

    // Картку закрывае толькі бан аўтара слова. Бан скаржніка яе не кранае:
    // слова застаецца на разгляд, бо да яго вінаватасць не мае дачынення.
    if (target.kind === 'author' && target.item) {
        target.item.resolved = true;
        target.item.seq = ++resolveSeq;
        target.item.resolvedAt = today();
        target.item.outcome = `аўтар забанены да ${formatLongDate(until)}`;
    }

    banDialog.value = false;
    banTarget.value = null;
    chosenTerm.value = null;
    ElMessage.success(`${target.name} забанены на ${term.label} — да ${formatLongDate(until)}`);
}

function unban(item) {
    item.author.banned = false;
    item.author.bannedUntil = null;
    bans.value = bans.value.filter((b) => b.person !== item.author);
    ElMessage.success('Бан зняты');
}

// Зняць бан са спісу банаў. Той жа вынік, што і «Зняць бан» на картцы, толькі
// адсюль здымаецца і з тых, у каго карткі на старонцы няма.
function liftBan(ban) {
    if (ban.person) {
        ban.person.banned = false;
        ban.person.bannedUntil = null;
    }

    bans.value = bans.value.filter((b) => b !== ban);
    ElMessage.success(`Бан з ${ban.name} зняты`);
}
</script>

<style scoped></style>
