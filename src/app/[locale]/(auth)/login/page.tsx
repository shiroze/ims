"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Mail, Smartphone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
// import { LuMail, LuSmartphone } from 'react-icons/lu';
import { useTranslations } from 'next-intl';

export default function SignIn() {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('auth.errors');
  const tSuccess = useTranslations('auth.success');
  // Set Default Values for Username and Password
  // For development purposes, you can set default values
  // to avoid typing them every time.
  // Remove these lines in production.
  const [username, setUsername] = useState(process.env.NODE_ENV === "development" ? "admin" : "");
  const [password, setPassword] = useState(process.env.NODE_ENV === "development" ? "paladin123" : "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"; // Default to /dashboard if no callbackUrl
  
  // Check for error in URL params (from NextAuth redirects)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      let errorKey = urlError;
      
      // Handle NextAuth's generic errors
      if (urlError === 'CredentialsSignin' || urlError === 'Configuration') {
        // Configuration error means an error was thrown in authorize
        // We'll show a generic message, but ideally we'd have the specific error
        errorKey = 'invalidCredentials';
      }
      
      // Try to get the translated error message
      // Support both camelCase and PascalCase error codes
      const errorMessage = tErrors(errorKey as any) || 
                          tErrors(errorKey.charAt(0).toLowerCase() + errorKey.slice(1) as any) ||
                          tErrors('default');
      setError(errorMessage);
    }
  }, [searchParams, tErrors]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setIsSubmitting(true);
    
    try {
      // First, validate credentials to get specific error messages
      const validateResponse = await fetch('/api/auth/validate-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const validateData = await validateResponse.json();

      if (!validateData.valid) {
        // We have a specific error from validation
        const errorKey = validateData.error || 'invalidCredentials';
        const errorMessage = tErrors(errorKey as any) || tErrors('default');
        setError(errorMessage);
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      // Credentials are valid, proceed with NextAuth signIn
      const result: any = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        // NextAuth returns error codes, translate them
        let errorKey = result.error;
        
        // Handle NextAuth's generic errors
        if (result.error === 'CredentialsSignin' || result.error === 'Configuration') {
          errorKey = 'invalidCredentials';
        }
        
        // Try to get the translated error message
        const errorMessage = tErrors(errorKey as any) || 
                            tErrors(errorKey.charAt(0).toLowerCase() + errorKey.slice(1) as any) ||
                            tErrors('default');
        setError(errorMessage);
        setIsLoading(false);
        setIsSubmitting(false);
      } else if (result?.ok) {
        // Login successful - keep button disabled during redirect
        setIsLoading(true);
        // Redirect to dashboard
        router.push(callbackUrl);
        // Note: We don't reset isSubmitting here because we're redirecting
        // The component will unmount, so state will reset naturally
      } else {
        setError(tErrors('default'));
        setIsLoading(false);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(tErrors('default'));
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={'wrapper'}>
      <Paper className={'form'}>
        <Title order={2} className={'title'}>
          Welcome back to IMS!
        </Title>

        <TextInput label="Email address" placeholder="hello@gmail.com" size="md" radius="md" />
        <PasswordInput label="Password" placeholder="Your password" mt="md" size="md" radius="md" />
        <Checkbox label="Keep me logged in" mt="xl" size="md" />
        <Button fullWidth mt="xl" size="md" radius="md">
          Login
        </Button>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{' '}
          <Anchor href="#" fw={500} onClick={(event) => event.preventDefault()}>
            Register
          </Anchor>
        </Text>
      </Paper>
    </div>
    
    // <div className="relative flex flex-row w-full overflow-hidden bg-gradient-to-r from-blue-900 h-screen to-blue-800 dark:to-blue-900 dark:from-blue-950">
    //   <div className="absolute inset-0 opacity-20">
    //     {/* <Image src={modern} alt="" /> */}
    //   </div>

    //   <div className="mx-4 m-4 w-160 py-14 px-10 bg-card flex justi+fy-center rounded-md text-center relative z-10">
    //     <div className="flex flex-col h-full w-full">
    //       <div className="flex justify-end">
    //       </div>

    //       <div className="my-21">
    //         <div className="mt-10">
    //           <div className="mt-10 w-100 mx-auto">
    //             <div id="tabsForEmail" role="tabpanel" aria-labelledby="tabs-with-underline-item-1">
    //               <form onSubmit={handleSubmit} className="text-left w-full mt-10">
    //                 {error && (
    //                   <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-md">
    //                     <p className="text-danger text-sm">{error}</p>
    //                   </div>
    //                 )}
    //                 <div className="mb-4 ">
    //                   <label
    //                     htmlFor="Username"
    //                     className="block  font-medium text-default-900 text-sm mb-2"
    //                   >
    //                     {t('email')}
    //                   </label>
    //                   <input
    //                     type="text"
    //                     id="Username"
    //                     className="form-input"
    //                     placeholder="Enter Username or email"
    //                     value={username}
    //                     onChange={(e) => {
    //                       setUsername(e.target.value);
    //                       setError(null);
    //                     }}
    //                     disabled={isLoading || isSubmitting}
    //                   />
    //                 </div>

    //                 <div className="mb-4">
    //                   <Link
    //                     href="/modern-reset-password"
    //                     className="text-primary font-medium text-sm mb-2 float-end"
    //                   >
    //                     Forgot Password ?
    //                   </Link>
    //                   <label
    //                     htmlFor="Password"
    //                     className="block  font-medium text-default-900 text-sm mb-2"
    //                   >
    //                     {t('password')}
    //                   </label>
    //                   <input
    //                     type="password"
    //                     id="Password"
    //                     className="form-input"
    //                     placeholder="Enter Password"
    //                     value={password}
    //                     onChange={(e) => {
    //                       setPassword(e.target.value);
    //                       setError(null);
    //                     }}
    //                     disabled={isLoading || isSubmitting}
    //                   />
    //                 </div>

    //                 <div className="flex items-center gap-2 mb-4">
    //                   <input id="checkbox-1" type="checkbox" className="form-checkbox" />
    //                   <label className="text-default-900 text-sm font-medium" htmlFor="checkbox-1">
    //                     Remember Me
    //                   </label>
    //                 </div>

    //                 <div className="mt-10 text-center">
    //                   <button 
    //                     type="submit" 
    //                     className="btn bg-primary text-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
    //                     disabled={isLoading || isSubmitting}
    //                   >
    //                     {isLoading ? tSuccess('redirecting') : t('submit')}
    //                   </button>
    //                 </div>

    //                 {/* <div className="my-9 relative text-center  before:absolute before:top-2.5 before:left-0 before:border-t before:border-t-default-200 before:w-full before:h-0.5 before:right-0 before:-z-0">
    //                   <h4 className="relative z-1 py-0.5 px-2 inline-block font-medium bg-card text-default-500 rounded-md">
    //                     Sign In with
    //                   </h4>
    //                 </div>

    //                 <div className="flex w-full justify-center items-center gap-2">
    //                   <Link
    //                     href="#"
    //                     className="btn border border-default-200 flex-grow hover:bg-default-150 shadow-sm hover:text-default-800"
    //                   >
    //                     <IconifyIcon icon={'logos:google-icon'} />
    //                     Use Google
    //                   </Link>

    //                   <Link
    //                     href="#"
    //                     className="btn border border-default-200 flex-grow hover:bg-default-150 shadow-sm hover:text-default-800"
    //                   >
    //                     <IconifyIcon icon={'logos:apple'} className="text-mono" />
    //                     Use Apple
    //                   </Link>
    //                 </div> */}

    //                 {/* <div className="mt-10 text-center">
    //                   <p className="text-base text-default-500">
    //                     Don't have an account ?
    //                     <Link
    //                       href="/modern-register"
    //                       className="font-semibold underline hover:text-primary transition duration-200"
    //                     >
    //                       {' '}
    //                       SignUp
    //                     </Link>
    //                   </p>
    //                 </div> */}
    //               </form>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       <div className="mt-5 flex justify-center">
    //         <span className="text-sm text-default-500 flex gap-1">
    //           {/* <IconifyIcon icon="lucide:copyright" className="w-4 h-4 align-middle" /> */}
    //           2025 J. Crafted with
    //           {/* <IconifyIcon
    //             icon="tabler:heart-filled"
    //             className="w-4 h-4 text-danger align-middle"
    //           /> */}
    //           by{' '}
    //           {/* <Link
    //             href="https://themesdesign.in/"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             className="text-default-800 hover:text-primary transition duration-200 underline"
    //           >
    //             Themesdesign
    //           </Link> */}
    //         </span>
    //       </div>
    //     </div>
    //   </div>

    //   <div className="relative z-10 flex items-center justify-center min-h-screen px-10 py-14 grow">
    //     <div>
    //       {/* <Link href="/index" className="index">
    //         <Image src={LogoLight} alt="" className="h-7 mb-14 mx-auto block" width={130} />
    //       </Link>

    //       <Image src={modernImg} alt="" className="mx-auto rounded-xl block object-cover w-md" /> */}
    //       <div className="mt-10 text-center">
    //         <h3 className="mb-3 text-blue-50 text-2xl font-semibold text-center">
    //           Tools For Crafting Your Business's Brand Identity
    //         </h3>
    //         <p className="text-blue-300 text-base w-2xl text-center">
    //           Unlock the potential of our versatile branding tools, designed to empower your
    //           business in shaping a distinctive and impactful brand. Elevate your business's image
    //           and leave a lasting impression with our comprehensive branding solutions.
    //         </p>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  )
}