import Head from "next/head";
import MailApp from "../components/MailApp";

export default function SentPage() {
  return (
    <>
      <Head>
        <title>Sent | Orbin Mail OS</title>
      </Head>
      <MailApp initialMailbox="sent" />
    </>
  );
}
