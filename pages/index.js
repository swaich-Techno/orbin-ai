import Head from "next/head";
import MailApp from "../components/MailApp";

export default function Home() {
  return (
    <>
      <Head>
        <title>Orbin Mail OS</title>
        <meta
          name="description"
          content="A modern email workspace for sorting, responding to, and organizing shared team mail."
        />
      </Head>
      <MailApp initialMailbox="inbox" />
    </>
  );
}
