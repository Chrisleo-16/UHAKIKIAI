import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_URL = 'https://uhakikiai.onrender.com';

// Code snippets for 26 programming languages
const codeSnippets = [
  {
    language: 'Python',
    icon: '🐍',
    color: '#3776AB',
    code: `import requests

response = requests.post(
    "${API_URL}/v1/verify_document",
    headers={"X-API-Key": "uh_live_xxx"},
    files={"file": open("cert.jpg", "rb")}
)
print(response.json())`
  },
  {
    language: 'JavaScript',
    icon: '🟨',
    color: '#F7DF1E',
    code: `const formData = new FormData();
formData.append('file', document.querySelector('input').files[0]);

const response = await fetch('${API_URL}/v1/verify_document', {
  method: 'POST',
  headers: { 'X-API-Key': 'uh_live_xxx' },
  body: formData
});
console.log(await response.json());`
  },
  {
    language: 'TypeScript',
    icon: '🔷',
    color: '#3178C6',
    code: `interface VerifyResponse {
  final_decision: 'VERIFIED' | 'REJECTED' | 'MANUAL_REVIEW';
  risk_score: number;
  details: string[];
}

const result = await fetch('${API_URL}/v1/verify_document', {
  method: 'POST',
  headers: { 'X-API-Key': 'uh_live_xxx' },
  body: formData
}).then(r => r.json() as Promise<VerifyResponse>);`
  },
  {
    language: 'cURL',
    icon: '🌐',
    color: '#073551',
    code: `curl -X POST '${API_URL}/v1/verify_document' \\
  -H 'X-API-Key: uh_live_xxx' \\
  -F 'file=@certificate.jpg'`
  },
  {
    language: 'Go',
    icon: '🐹',
    color: '#00ADD8',
    code: `package main

import (
    "bytes"
    "mime/multipart"
    "net/http"
)

func verify() {
    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    // Add file to writer...
    req, _ := http.NewRequest("POST", 
        "${API_URL}/v1/verify_document", body)
    req.Header.Set("X-API-Key", "uh_live_xxx")
    client := &http.Client{}
    resp, _ := client.Do(req)
}`
  },
  {
    language: 'Rust',
    icon: '🦀',
    color: '#CE422B',
    code: `use reqwest::multipart;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let form = multipart::Form::new()
        .file("file", "certificate.jpg")?;
    
    let client = reqwest::Client::new();
    let res = client.post("${API_URL}/v1/verify_document")
        .header("X-API-Key", "uh_live_xxx")
        .multipart(form)
        .send().await?;
    Ok(())
}`
  },
  {
    language: 'Java',
    icon: '☕',
    color: '#007396',
    code: `HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${API_URL}/v1/verify_document"))
    .header("X-API-Key", "uh_live_xxx")
    .POST(HttpRequest.BodyPublishers.ofFile(
        Path.of("certificate.jpg")))
    .build();
HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());`
  },
  {
    language: 'Kotlin',
    icon: '🟣',
    color: '#7F52FF',
    code: `val client = OkHttpClient()
val body = MultipartBody.Builder()
    .setType(MultipartBody.FORM)
    .addFormDataPart("file", "cert.jpg",
        File("cert.jpg").asRequestBody())
    .build()

val request = Request.Builder()
    .url("${API_URL}/v1/verify_document")
    .addHeader("X-API-Key", "uh_live_xxx")
    .post(body).build()
client.newCall(request).execute()`
  },
  {
    language: 'Swift',
    icon: '🍎',
    color: '#FA7343',
    code: `var request = URLRequest(url: URL(string: 
    "${API_URL}/v1/verify_document")!)
request.httpMethod = "POST"
request.setValue("uh_live_xxx", 
    forHTTPHeaderField: "X-API-Key")

let task = URLSession.shared.uploadTask(
    with: request, 
    from: fileData
) { data, response, error in
    // Handle response
}`
  },
  {
    language: 'C#',
    icon: '🟢',
    color: '#239120',
    code: `using var client = new HttpClient();
using var content = new MultipartFormDataContent();
content.Add(new ByteArrayContent(
    File.ReadAllBytes("cert.jpg")), "file", "cert.jpg");

client.DefaultRequestHeaders.Add("X-API-Key", "uh_live_xxx");
var response = await client.PostAsync(
    "${API_URL}/v1/verify_document", content);
var result = await response.Content.ReadAsStringAsync();`
  },
  {
    language: 'PHP',
    icon: '🐘',
    color: '#777BB4',
    code: `<?php
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => '${API_URL}/v1/verify_document',
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['X-API-Key: uh_live_xxx'],
    CURLOPT_POSTFIELDS => [
        'file' => new CURLFile('certificate.jpg')
    ],
    CURLOPT_RETURNTRANSFER => true
]);
$response = curl_exec($curl);`
  },
  {
    language: 'Ruby',
    icon: '💎',
    color: '#CC342D',
    code: `require 'net/http'
require 'uri'

uri = URI.parse('${API_URL}/v1/verify_document')
request = Net::HTTP::Post.new(uri)
request['X-API-Key'] = 'uh_live_xxx'

form_data = [['file', File.open('cert.jpg')]]
request.set_form(form_data, 'multipart/form-data')

response = Net::HTTP.start(uri.hostname, uri.port, 
    use_ssl: true) { |http| http.request(request) }`
  },
  {
    language: 'Dart',
    icon: '🎯',
    color: '#0175C2',
    code: `import 'package:http/http.dart' as http;

var request = http.MultipartRequest('POST',
    Uri.parse('${API_URL}/v1/verify_document'));
request.headers['X-API-Key'] = 'uh_live_xxx';
request.files.add(await http.MultipartFile.fromPath(
    'file', 'certificate.jpg'));

var response = await request.send();
print(await response.stream.bytesToString());`
  },
  {
    language: 'Scala',
    icon: '🔴',
    color: '#DC322F',
    code: `import sttp.client3._

val response = basicRequest
  .post(uri"${API_URL}/v1/verify_document")
  .header("X-API-Key", "uh_live_xxx")
  .multipartBody(
    multipartFile("file", new File("cert.jpg"))
  )
  .send(HttpURLConnectionBackend())`
  },
  {
    language: 'Elixir',
    icon: '💧',
    color: '#4B275F',
    code: `{:ok, response} = HTTPoison.post(
  "${API_URL}/v1/verify_document",
  {:multipart, [
    {:file, "certificate.jpg", 
     {"form-data", [name: "file", filename: "cert.jpg"]}, []}
  ]},
  ["X-API-Key": "uh_live_xxx"]
)`
  },
  {
    language: 'Clojure',
    icon: '🟡',
    color: '#5881D8',
    code: `(require '[clj-http.client :as client])

(client/post "${API_URL}/v1/verify_document"
  {:headers {"X-API-Key" "uh_live_xxx"}
   :multipart [{:name "file"
                :content (clojure.java.io/file "cert.jpg")}]})`
  },
  {
    language: 'Perl',
    icon: '🐪',
    color: '#39457E',
    code: `use LWP::UserAgent;
use HTTP::Request::Common;

my $ua = LWP::UserAgent->new;
my $response = $ua->request(POST 
    '${API_URL}/v1/verify_document',
    'X-API-Key' => 'uh_live_xxx',
    Content_Type => 'form-data',
    Content => [file => ['certificate.jpg']]
);`
  },
  {
    language: 'Lua',
    icon: '🌙',
    color: '#000080',
    code: `local http = require("socket.http")
local ltn12 = require("ltn12")

local response = {}
http.request{
    url = "${API_URL}/v1/verify_document",
    method = "POST",
    headers = {["X-API-Key"] = "uh_live_xxx"},
    source = ltn12.source.file(io.open("cert.jpg", "rb")),
    sink = ltn12.sink.table(response)
}`
  },
  {
    language: 'R',
    icon: '📊',
    color: '#276DC3',
    code: `library(httr)

response <- POST(
  "${API_URL}/v1/verify_document",
  add_headers("X-API-Key" = "uh_live_xxx"),
  body = list(file = upload_file("certificate.jpg")),
  encode = "multipart"
)
content(response)`
  },
  {
    language: 'Julia',
    icon: '🟣',
    color: '#9558B2',
    code: `using HTTP

response = HTTP.post(
    "${API_URL}/v1/verify_document",
    ["X-API-Key" => "uh_live_xxx"],
    HTTP.Form(Dict("file" => open("cert.jpg", "r")))
)
println(String(response.body))`
  },
  {
    language: 'Haskell',
    icon: 'λ',
    color: '#5D4F85',
    code: `{-# LANGUAGE OverloadedStrings #-}
import Network.HTTP.Client.MultipartFormData

request <- parseRequest "POST ${API_URL}/v1/verify_document"
let request' = request { requestHeaders = 
    [("X-API-Key", "uh_live_xxx")] }
formDataBody [partFileSource "file" "cert.jpg"] request'`
  },
  {
    language: 'OCaml',
    icon: '🐫',
    color: '#EC6813',
    code: `open Cohttp_lwt_unix

let body = 
  Cohttp_lwt.Body.of_string (read_file "cert.jpg")

Client.post 
  ~headers:(Header.add_list (Header.init ()) 
    [("X-API-Key", "uh_live_xxx")])
  ~body
  (Uri.of_string "${API_URL}/v1/verify_document")`
  },
  {
    language: 'F#',
    icon: '🔵',
    color: '#378BBA',
    code: `open System.Net.Http

let client = new HttpClient()
client.DefaultRequestHeaders.Add("X-API-Key", "uh_live_xxx")

let content = new MultipartFormDataContent()
content.Add(new ByteArrayContent(
    File.ReadAllBytes("cert.jpg")), "file", "cert.jpg")

let! response = client.PostAsync(
    "${API_URL}/v1/verify_document", content) |> Async.AwaitTask`
  },
  {
    language: 'Shell',
    icon: '🖥️',
    color: '#89E051',
    code: `#!/bin/bash

API_KEY="uh_live_xxx"
FILE="certificate.jpg"

curl -X POST "${API_URL}/v1/verify_document" \\
  -H "X-API-Key: $API_KEY" \\
  -F "file=@$FILE" | jq .`
  },
  {
    language: 'PowerShell',
    icon: '💠',
    color: '#012456',
    code: `$headers = @{
    "X-API-Key" = "uh_live_xxx"
}

$form = @{
    file = Get-Item -Path "certificate.jpg"
}

Invoke-RestMethod -Uri "${API_URL}/v1/verify_document" \`
    -Method Post -Headers $headers -Form $form`
  },
  {
    language: 'Groovy',
    icon: '⭐',
    color: '#4298B8',
    code: `@Grab('org.apache.httpcomponents:httpclient:4.5.13')
import org.apache.http.client.methods.HttpPost
import org.apache.http.entity.mime.MultipartEntityBuilder

def post = new HttpPost("${API_URL}/v1/verify_document")
post.setHeader("X-API-Key", "uh_live_xxx")
post.setEntity(MultipartEntityBuilder.create()
    .addBinaryBody("file", new File("cert.jpg"))
    .build())`
  }
];

export function CodeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % codeSnippets.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + codeSnippets.length) % codeSnippets.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentSnippet = codeSnippets[currentIndex];

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Language indicators */}
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {codeSnippets.map((snippet, index) => (
          <button
            key={snippet.language}
            onClick={() => setCurrentIndex(index)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary text-primary-foreground scale-110'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <span className="mr-1">{snippet.icon}</span>
            {snippet.language}
          </button>
        ))}
      </div>

      {/* Code display */}
      <div className="relative bg-[#0d1117] rounded-2xl border border-border/30 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-sm font-medium text-muted-foreground ml-2">
              {currentSnippet.icon} {currentSnippet.language}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(currentSnippet.code, currentIndex)}
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            {copiedIndex === currentIndex ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Code content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <pre className="text-sm font-mono text-[#c9d1d9] overflow-x-auto whitespace-pre-wrap">
              <code>{currentSnippet.code}</code>
            </pre>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1 mt-4">
        {codeSnippets.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-center text-sm text-muted-foreground mt-3">
        {currentIndex + 1} of {codeSnippets.length} languages supported
      </p>
    </div>
  );
}
