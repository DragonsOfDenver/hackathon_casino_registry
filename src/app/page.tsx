"use client";
import React, { useState } from "react";
import styles from "./page.module.css";
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { namehash, normalize } from 'viem/ens'
import { Form, Field, ErrorMessage, Formik } from 'formik';
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const validationSchema = Yup.object().shape({
    userInput: Yup.string().required("Required").matches(
        /^(0x[a-fA-F0-9]{40})|([a-zA-Z0-9-]+\.eth)$/g,
        "Invalid Ethereum address or ENS name"
    ),
});

export default function Home() {
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const apiURL = process.env.NEXT_PUBLIC_API_URL || '';
    console.log("API URL: ", apiURL)

    // check for ens names bruh
    const publicClient = createPublicClient({
        chain: mainnet,
        transport: http()
    })

    const CheckAddressToENS = async (currentAddress: string) => {
        setLoading(true);
        setError(null);
        try {
            // Check if the input is an ENS name or an address
            // by checking if it has a dot eth at the end 
            if (currentAddress.endsWith(".eth")) {
                const ResolverAddress = await publicClient.getEnsAddress({
                    name: normalize(currentAddress),
                })

                if (ResolverAddress === null) {
                    setError("No Address found for the ENS name")
                    toast.error("No Address found for the ENS name")
                } else {

                    const payload = {
                        ResolverAddress: ResolverAddress,
                        address: currentAddress
                    }
                    const response = await fetch(apiURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })
                }
                setLoading(false)
            } else {
                const payload = {
                    ResolverAddress: currentAddress,
                    address: null
                }
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
            }
        } catch (error) {
            setError("Failed to store the address in the database.")
            toast.error("Failed to store the address in the database.")
            setLoading(false)
        } finally {
            setLoading(false);
            toast.success("We got your address :)")
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.title}>Wanna join the Bufficorn Casino?</h1>
                <p className={styles.description}>
                    Enter your address or ENS name to join the Bufficorn Casino, come time to play.
                </p>

                <Formik
                    initialValues={{ userInput: "" }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        setError(null); // Clear previous errors
                        setAddress(values.userInput); // Set address
                        CheckAddressToENS(values.userInput); // Check address
                        setSubmitting(false); // Finish form submission
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className={styles.form}>
                            <Field
                                type="text"
                                name="userInput"
                                placeholder="Enter here 🦄🎰🎲🃏🎮🎰🦄"
                                className={styles.input}
                            />
                            <ErrorMessage name="userInput" component="div" className={styles.error} />
                            <button type="submit" className={styles.button} disabled={isSubmitting || loading || error}>
                                Join Bufficorn Casino
                            </button>
                        </Form>
                    )}
                </Formik>

            </div>
            <ToastContainer position="bottom-center" autoClose={5000} />
        </main>
    );
}
