import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SpamuraiFrontend() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setStatus(["Starting spam detection..."]);

    try {
      setStatus((prev) => [...prev, "Connecting to email server..."]);

      const response = await fetch("http://localhost:3000/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, description }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        partial += decoder.decode(value, { stream: true });
        const updates = partial.split("\n");
        setStatus((prev) => [...prev, ...updates.filter((line) => line)]);
      }
    } catch (error) {
      setStatus((prev) => [...prev, `Error: ${error.message}`]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <Card className="p-4">
        <CardContent className="space-y-4">
          <h1 className="text-2xl font-bold">Spamurai Frontend</h1>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Textarea
            placeholder="Working Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Start Scan"}
          </Button>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Status Updates</h2>
          <div className="h-64 overflow-y-auto bg-gray-100 p-2 rounded">
            {status.map((line, index) => (
              <div key={index} className="text-sm text-gray-800">
                {line}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
