import { supabase } from './supabase';

function getUser() {
    try {
        //TODO get login
        const user = supabase.auth.user();
        console.log(user);
        return user ? user : null;
    } catch {
        return null;
    }
}

async function signInWithGoogle() {
    const options = import.meta.env.VITE_REDIRECT_URL
        ? { redirectTo: import.meta.env.VITE_REDIRECT_URL }
        : { redirectTo: window.location.origin };
    const { error } = await supabase.auth.signIn({ provider: 'google' }, options);
    if (error) {
        throw error;
    }
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signIn({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}

async function signUp(email, password, login) {
    const { data, error } = await supabase.auth.signUp(
        {
            email,
            password,
        },
        {
            redirectTo: import.meta.env.VITE_REDIRECT_URL,
            data: {
                login,
                name: login,
            },
        }
    );

    if (error) {
        throw error;
    }

    return data;
}

export { getUser, signInWithGoogle, signUp, signIn };
