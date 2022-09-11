import {supabase} from "./supabase.js";
import {getUser}  from "./user.js";

export const vote = async (definition, type) => {
    const user          = getUser();
    const negative_type = type === 'upvote' ? 'downvote' : 'upvote'

    if (definition.vote_results[0] && definition.vote_results[0]['is_' + type + 'd']) {
        await supabase.from('votes').delete().eq('definition_id', definition.id).eq('user_id', user.id)
        definition.vote_results[0]['is_' + type + 'ed'] = false
        definition.vote_results[0][type + 'e']--
    } else {
        await supabase.from('votes').insert([
            {type: type, 'user_id': user.id, definition_id: definition.id},
        ], {upsert: true, onConflict: 'definition_id,user_id'})
        if (!definition.vote_results[0]) {
            const item = {
                ['is_' + type + 'ed']         : true,
                ['is_' + negative_type + 'ed']: 0,
                downvotes                     : 0,
                upvotes                       : 0
            }
            item[type + 'e']++
            definition.vote_results.push(
                item
            )
        } else {
            definition.vote_results[0]['is_' + type + 'ed']          = true
            definition.vote_results[0]['is_' + negative_type + 'ed'] = false
            definition.vote_results[0][type + 'e']++
            definition.vote_results[0][negative_type + 'e']--
        }

    }

    return definition
}
