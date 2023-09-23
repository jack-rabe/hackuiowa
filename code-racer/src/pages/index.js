import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <h1 className="text-center text-3xl">Code Race</h1>
      <br />
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-1">
          <h3 className="text-2xl">Problem</h3>
        </div>
        <div class="col-span-1">
          <h3 className="text-2xl">Code</h3>
          <textarea
            id="solution"
            class="border-2 border-gray-400 rounded-lg"
            rows="4"
            cols="50"
            defaultValue="function solution(x) {
              
            }"
          />
          <br />
          <button className="btn btn-primary">Submit</button>
        </div>
      </div>
    </>
  );
}
