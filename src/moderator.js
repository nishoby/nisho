import { supabase } from './supabase.js';
import { getUser } from './auth.js';

// Ці мае гэты чалавек правы мадэратара.
//
// Правы жывуць у табліцы `moderator` у базе, а не ў профілі карыстальніка:
// усё, што ляжыць у профілі, чалавек можа памяняць сам праз updateUser, і
// «мадэратарам» стаў бы кожны, хто адкрыў кансоль браўзера.
//
// Пытаемся адзін раз на загрузку старонкі і запамінаем адказ: пытанне «а я
// мадэратар?» узнікае і ў меню, і пры кожным пераходзе на старонку, і хадзіць
// па яго ў сетку кожны раз няма чаго.
let asked = null;

function isModerator() {
    if (asked) {
        return asked;
    }

    asked = (async () => {
        const user = await getUser();

        if (!user) {
            return false;
        }

        const { data, error } = await supabase.from('moderator').select('user_id').eq('user_id', user.id).limit(1);

        // Памылка тут азначае «няма табліцы» ці «няма правоў яе чытаць».
        // І тое і другое чытаем аднолькава: правоў няма. Моўчкі, без крыку на
        // старонцы — звычайнаму чалавеку няма чаго ведаць, што такая табліца
        // наогул існуе.
        if (error) {
            return false;
        }

        return Boolean(data && data.length);
    })();

    return asked;
}

// Пасля ўваходу ці выхаду адказ ужо не той — пытаемся нанова.
function forgetModerator() {
    asked = null;
}

export { isModerator, forgetModerator };
