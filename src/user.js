import {supabase} from './supabase'

function getUser() {
    try {
        let user = supabase.auth.user()
        return user ? user : {email: ''}
    } catch {
        return {email: ''}
    }
}

export {getUser}
