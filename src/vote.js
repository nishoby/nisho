import {supabase} from "./supabase.js";
import {getUser}  from "./user.js";

export const vote = async (definition, type) => {
    const user          = getUser();
    const negative_type = type === 'upvote' ? 'downvote' : 'upvote'

    if (definition.vote_results[0] && definition.vote_results[0]['is_' + type + 'd']) {
        await supabase.from('votes').delete().eq('definition_id', definition.id).eq('user_id', user.id)
        definition.vote_results[0]['is_' + type + 'd'] = false
        definition.vote_results[0][type + 's']--
    } else {
        await supabase.from('votes').insert([
            {type: type, 'user_id': user.id, definition_id: definition.id},
        ], {upsert: true, onConflict: 'definition_id,user_id'})
        if (!definition.vote_results[0]) {
            const item = {
                ['is_' + type + 'd']         : true,
                ['is_' + negative_type + 'd']: 0,
                downvotes                    : 0,
                upvotes                      : 0
            }
            item[type]++
            definition.vote_results.push(
                item
            )
        } else {
            definition.vote_results[0]['is_' + type + 'd']          = true
            definition.vote_results[0]['is_' + negative_type + 'd'] = false
            definition.vote_results[0][type + 's']++
            definition.vote_results[0][negative_type + 's']--
        }
    }

    return definition
}
