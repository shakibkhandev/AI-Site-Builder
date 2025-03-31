'use client';

import { useState } from 'react';
import { Github, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a website description.');
      return;
    }

    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const fullPrompt = `Generate a complete HTML file with inline CSS based on the user's description. Include a header, main content, and footer unless specified otherwise. The website should be modern, responsive, and use best practices. Here's the user's description: ${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const generatedCode = response.text();

      if (!generatedCode) {
        throw new Error('No code generated');
      }

      setGeneratedCode(generatedCode);
      toast.success('Website generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating website. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold">AI Site Builder</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a
              href="https://github.com/yourusername/ai-site-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 border-b lg:border-b-0 lg:border-r bg-muted/30 p-4 md:p-6 lg:fixed lg:left-0 lg:top-16 lg:bottom-0">
          <div className="flex flex-col h-full gap-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Website Description</h2>
              <p className="text-sm text-muted-foreground">
                Describe your website and we'll generate it for you using AI.
              </p>
            </div>
            <Textarea
              className="flex-grow min-h-[200px] resize-none"
              placeholder="Describe your website, e.g., A portfolio site with a navbar, hero section, and contact form"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="space-y-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
              <Button
                className="w-full"
                size="lg"
                variant="secondary"
                onClick={handleDownload}
                disabled={!generatedCode}
              >
                Download Code
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="w-full lg:w-3/4 lg:ml-[25%] p-4 md:p-6">
          <Card className="w-full h-[calc(100vh-8rem)] overflow-hidden border-2">
            {generatedCode ? (
              <iframe
                srcDoc={generatedCode}
                className="w-full h-full rounded-lg"
                title="Website Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground p-6">
                <div className="text-center space-y-4">
                  <div className="bg-primary/5 p-6 rounded-full inline-block">
                    <Sparkles className="w-12 h-12 mx-auto text-primary" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-semibold">Ready to Build</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter a description of your website in the sidebar and click Generate to create your custom website using AI.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}