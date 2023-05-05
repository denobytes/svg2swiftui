import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";
import { convert } from "npm:svg-to-swiftui-core@0.3.3";

const args = parse(Deno.args, {
  boolean: [
    // instructions for this script
    "help",
  ],
  string: [
    // svg filename to process
    "file",
    "f",

    // remote url of svg to process
    "url",
    "r",

    // output filename
    "output",
    "o",
  ],
});

const commandName = `svg2swiftui`;

const usageMessage = `
Usage: ${commandName} [OPTIONS]
Options:
  --help              Show this help message

  -f, --file  NAME    NAME of input SVG
  -o, --output NAME   Write output to NAME
  -u, --url URL       URL location of svg file

  Examples:
  ${commandName} -u https://deno.com/logo.svg
  ${commandName} -f sample.svg -o sample.swift
  cat sample.svg | ${commandName}
`;

// parse args
const help = args.help;
const svgFilename = args.file || args.f;
const svgUrl = args.url || args.r;
const outputFilename = args.output || args.o;
const readStdin = !svgFilename && !svgUrl && args._.length == 0;

if (help) {
  console.log(usageMessage);
  Deno.exit();
}

let svgStr = "";

if (readStdin) {
  const decoder = new TextDecoder();
  for await (const chunk of Deno.stdin.readable) {
    const textChunk = decoder.decode(chunk);
    svgStr += textChunk;
  }
}

// only one source
if (svgFilename && svgUrl) {
  console.log(usageMessage);
  Deno.exit();
}

// process
if (svgFilename) {
  let text = Deno.readTextFileSync(svgFilename);
  svgStr = text;
}
if (svgUrl) {
  let text = await fetch(svgUrl);
  svgStr = text;
}

let result = convert(svgStr);

if (outputFilename) {
  try {
    Deno.writeTextFileSync(outputFilename, result);
  } catch (e) {
    console.log(e.message);
  }
} else {
  console.log(result);
}
