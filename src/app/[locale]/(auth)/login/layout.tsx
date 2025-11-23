import { Metadata } from "next";
import Page from "./page";

export const metadata: Metadata = {
  title: "Login"
};

export default function PageLayout(){
  return(<Page />)
}