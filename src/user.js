import {supabase} from './supabase'

function getUser() {
    try {
        let user = supabase.auth.user()
        return user ? user : null
    } catch {
        return null
    }
}

export {getUser}
