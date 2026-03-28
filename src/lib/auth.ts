import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GithubProvider({
            clientId: (process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID) as string,
            clientSecret: (process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET) as string,
            authorization: {
                params: {
                    scope: 'read:user user:email repo'
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            return session;
        }
    },
    pages: {
        signIn: '/',
    }
};
