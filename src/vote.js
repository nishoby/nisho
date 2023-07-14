import { supabase } from './supabase.js';
import { getUser } from './auth.js';

export const EMPTY_VOTE_RESULT = {
    downvotes: 0,
    upvotes: 0,
    is_upvoted: false,
    is_downvoted: false,
};

export const getVoteResult = (definition) => definition.vote_result || EMPTY_VOTE_RESULT;

export const removeVote = async (definition) => {
    const user = await getUser();

    await supabase.from('votes').delete().eq('definition_id', definition.definition_id).eq('user_id', user.id);
};

export const upsertVote = async (definition, type) => {
    const user = await getUser();

    await supabase.from('votes').upsert(
        {
            definition_id: definition.definition_id,
            user_id: user.id,
            type,
        },
        {
            onConflict: 'definition_id,user_id',
        }
    );
};

export const vote = async (definition, type) => {
    const voteResult = getVoteResult(definition);
    const isVoteRemoved =
        (type === 'upvote' && voteResult.is_upvoted) || (type === 'downvote' && voteResult.is_downvoted);

    if (isVoteRemoved) {
        await removeVote(definition);
    } else {
        await upsertVote(definition, type);
    }

    return definition;
};
