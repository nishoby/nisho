import { supabase } from './supabase';

async function getUser() {
    try {
        const { data } = await supabase.auth.getUser();
        return data.user;
    } catch {
        return null;
    }
}

async function signInWithGoogle() {
    const options = import.meta.env.VITE_REDIRECT_URL
        ? { redirectTo: import.meta.env.VITE_REDIRECT_URL }
        : { redirectTo: window.location.origin };
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options });
    if (error) {
        throw error;
    }
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}

async function signUp(email, password, login) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: import.meta.env.VITE_REDIRECT_URL,
            data: {
                username: login,
            },
        },
    });

    if (error) {
        throw error;
    }

    return data;
}

async function restorePassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: import.meta.env.VITE_REDIRECT_URL + '/novyy-parol',
    });

    if (error) {
        throw error;
    }
}

export { getUser, signInWithGoogle, signUp, signIn, restorePassword };
