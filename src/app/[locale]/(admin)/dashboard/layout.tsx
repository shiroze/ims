import { Metadata } from "next";
import Page from "./page";

export const metadata: Metadata = {
  title: "Dashboard"
};

export default function PageLayout(){
  return(<Page />)
}