'use client';

/**
 * Newsletter signup, shared by every form that offers it — the footer and the
 * blog's dispatch band today.
 *
 * It lives here rather than in either component because the two forms must not
 * drift: they post the same body to the same route, and the honeypot only works
 * if every form carries the field the route checks for. Copying this once is
 * how one of them quietly stops being protected.
 *
 * There is no mailing list yet — /api/subscribe emails the address to the owner
 * — so the terminal state is 'sent', not 'subscribed'.
 */

import { useRef, useState, type FormEvent, type RefObject } from 'react';

export type SubscribeState = 'idle' | 'sending' | 'sent' | 'error';

const SUCCESS = 'Thank you for subscribing.';

export function useSubscribe() {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<SubscribeState>('idle');
    const [message, setMessage] = useState('');
    const honeyRef = useRef<HTMLInputElement>(null);

    /** Clears a stale verdict as they type, so it never describes a different address. */
    function onEmailChange(value: string) {
        setEmail(value);
        if (state !== 'idle') {
            setState('idle');
            setMessage('');
        }
    }

    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (state === 'sending') return;

        /* Both forms set `noValidate` so the outcome is always this styled
           message rather than a native bubble for one case and a message for
           the rest — which means the empty case has to be caught here, or it
           costs a round trip to be told the obvious. */
        const value = email.trim();
        if (!value) {
            setState('error');
            setMessage('Please enter your email address.');
            return;
        }

        setState('sending');
        setMessage('');

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: value, aw_subscribe_ref: honeyRef.current?.value ?? '' }),
            });
            const json = (await res.json().catch(() => ({}))) as { error?: string };

            if (!res.ok) {
                setState('error');
                setMessage(json.error || 'Something went wrong. Please try again.');
                return;
            }

            setState('sent');
            setMessage(SUCCESS);
            setEmail('');
        } catch {
            /* fetch only rejects on a transport failure, so this really is the
               network rather than a rejection from the route. */
            setState('error');
            setMessage('Could not reach the server. Please check your connection.');
        }
    }

    return { email, state, message, honeyRef, onEmailChange, submit };
}

/**
 * The hidden field bots fill in and people never see. Off-screen rather than
 * `display:none`, which the better bots check for; never focusable, never
 * announced. Must be rendered inside every subscribe form — the route keys its
 * silent-discard branch on this exact name.
 */
export function SubscribeHoneypot({ inputRef }: { inputRef: RefObject<HTMLInputElement | null> }) {
    return (
        <input
            ref={inputRef}
            type="text"
            name="aw_subscribe_ref"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
    );
}
