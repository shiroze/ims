import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "~/schemas/sign-in"
// Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "~/utils/password"
// import { getUserFromDb } from "~/utils/db"
import { getTranslations } from 'next-intl/server';

import axios from "axios"
 
export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth
} = NextAuth({
  providers: [
    Credentials({
      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      name: "Credentials",
      credentials: {
        username: {
          label: 'Username',
          type: 'text'
        },
        password: {
          label: 'Password',
          type: 'password',
        }
      },
      /**
       * Verify the username and password supplied against a database or service.
       * The function should return a user object if the credentials are valid, or null if not.
       * The user object should contain at least the following properties:
       * - id: a unique identifier for the user
       * - name: the name of the user
       * - email: the email address of the user
       * - role: the role of the user (e.g. "Admin", "User")
       * @param {Object} credentials Contains the username and password supplied by the user.
       * @returns {Promise<Object | null>} A user object if the credentials are valid, or null if not.
       */
      async authorize(credentials, request) {
        const { username, password } = credentials;
        
        const locale = request.headers?.get('accept-language')?.split(',')[0] || 'en';
        const t = await getTranslations({ locale, namespace: 'auth.errors' });

        if (!credentials?.username || !credentials?.password) {
          throw new Error('invalidCredentials');
        }

        try {
          const response = await axios.post(`${process.env.API_URL}/login`, { username, password });
          
          const { data } = response;

          if (response.status === 401) {
            throw new Error(data.message);
          }

          // if (!response) {
          //   throw new Error('userNotFound');
          // }

          // if (response.locked) {
          //   throw new Error('accountLocked');
          // }

          if (response.status === 200) {
            return {
              id: data.user.id,
              username: data.user.username,
              name: data.user.name,
              role: data.user.role,
              permissions: data.permissions,
              token: data.token,
            };
          }

          return null;
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    }),
  ],
  secret: process.env.AUTH_SECRET,
  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 60 * 30 // 30 minutes // 24 * 60 * 60 * 30 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },
  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user }) {
      if (user) {
        /*
         * For adding custom parameters to user in session, we first need to add those parameters
         * in token which then will be available in the `session()` callback
         */
        // @ts-ignore
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.role = user.role;
        token.permissions = user.permissions;
        token.accessToken = user.token; // ** Access token from the API response
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        // @ts-ignore
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.accessToken = token.accessToken; // ** Access token from the API response
      }

      return session
    },
  }
})