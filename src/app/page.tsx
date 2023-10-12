"use client"

import {Input} from "@fluentui/react-components";

export default function Home() {

  const handleInputChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e?.target.value);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">

      <h1>FulentDash</h1>
      <p>Fast and Fluentious</p>

      <div className="flex place-items-center">
           <Input onChange={handleInputChange} />
      </div>

    </main>
  )
}
