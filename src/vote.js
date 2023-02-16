import {supabase} from "./supabase.js";
import {getUser}  from "./user.js";

export const EMPTY_VOTE_RESULT = {
    downvotes: 0,
    upvotes: 0,
    is_upvoted: false,
    is_downvoted: false
}

// There couldn't be more than one vote result, because the view is based on definition id
export const getVoteResult = (definition) => definition.vote_results[0] || EMPTY_VOTE_RESULT

const removeLocalVote = (voteResult) => {
    if (voteResult.is_upvoted) {
        voteResult.is_upvoted = false
        voteResult.upvotes--
    }

    if (voteResult.is_downvoted) {
        voteResult.is_downvoted = false
        voteResult.downvotes--
    }
}

const addLocalVote = (voteResult, type) => {
    if (type === 'upvote') {
        voteResult.is_upvoted = true
        voteResult.upvotes++
    } else {
        voteResult.is_downvoted = true
        voteResult.downvotes++
    }
}

export const removeVote = async (definition) => {
    const user = getUser()

    await supabase.from('votes').delete()
        .eq('definition_id', definition.id)
        .eq('user_id', user.id)

    const voteResult = getVoteResult(definition)
    removeLocalVote(voteResult)
}

export const upsertVote = async (definition, type) => {
    const user = getUser()

    await supabase.from('votes').upsert({
        definition_id: definition.id,
        user_id: user.id,
        type
    }, {
        onConflict: 'definition_id,user_id'
    })

    const voteResult = getVoteResult(definition)
    removeLocalVote(voteResult)
    addLocalVote(voteResult, type)
}

export const vote = async (definition, type) => {
    const voteResult = getVoteResult(definition)
    const isVoteRemoved = (type === 'upvote' && voteResult.is_upvoted)
        || (type === 'downvote' && voteResult.is_downvoted)

    if (isVoteRemoved) {
        await removeVote(definition)
    } else {
        await upsertVote(definition, type)
    }

    return definition
}
