"use client"

import { useState, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Upload,
  Link2,
  FileText,
  Calendar,
  Award,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { View } from "@/types/lms"

interface AssignmentViewProps {
  onCancel: () => void
}

export function AssignmentView({ onCancel }: AssignmentViewProps) {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [urlValue, setUrlValue] = useState("")
  const [textValue, setTextValue] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSubmit() {
    setSubmitted(true)
    toast({
      title: "Assignment submitted successfully",
      description: "Your submission has been recorded. Check back for feedback.",
    })
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setUploadedFile(file.name)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setUploadedFile(file.name)
  }

  return (
    <>
      <div className="mx-auto max-w-3xl">
        {/* Assignment header card */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-card-foreground text-balance leading-snug">
                Assignment 1: ICU Readmission Prediction Model
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">IFB220: Data Technologies</p>
            </div>
            <Badge
              variant={submitted ? "default" : "outline"}
              className={cn(
                "shrink-0 gap-1.5 px-3 py-1 text-sm",
                submitted && "bg-emerald-600 text-white border-transparent"
              )}
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Submitted
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  Not Submitted
                </>
              )}
            </Badge>
          </div>

          {/* Meta row */}
          <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Due: <strong className="text-foreground">Fri 28 Mar 2026, 11:59 PM</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 shrink-0" />
              <span>Points: <strong className="text-foreground">100</strong></span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <section className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-card-foreground">Instructions</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-2">
            <p>
              Build a machine learning model to predict ICU patient readmission risk using the MIMIC-III dataset.
              Your solution must implement an interpretable model (e.g., Explainable Boosting Machine or SHAP-annotated
              XGBoost) and provide clinical justification for feature selection.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upload your Next.js project ZIP or provide a GitHub repository link.</li>
              <li>Ensure all environment variables are documented in a <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.example</code> file.</li>
              <li>Include a <code className="text-xs bg-muted px-1 py-0.5 rounded">README.md</code> with setup and run instructions.</li>
              <li>Models must achieve a minimum AUC-ROC of 0.75 on the held-out test set.</li>
            </ul>
          </div>
        </section>

        {/* Submission form */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-card-foreground">Submit Your Work</h2>

          <Tabs defaultValue="file">
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="file" className="gap-2">
                <Upload className="h-4 w-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2">
                <Link2 className="h-4 w-4" />
                Website URL
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2">
                <FileText className="h-4 w-4" />
                Text Entry
              </TabsTrigger>
            </TabsList>

            {/* File Upload Tab */}
            <TabsContent value="file">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors",
                  dragOver
                    ? "border-primary bg-accent"
                    : "border-border bg-muted/30 hover:border-primary/50 hover:bg-accent/30"
                )}
              >
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{uploadedFile}</p>
                      <p className="text-sm text-muted-foreground">File ready to submit</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Drag and drop your file here</p>
                      <p className="mt-1 text-sm text-muted-foreground">ZIP, PDF, or any project file (max 100 MB)</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  aria-label="Upload file"
                />
              </div>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url">
              <div className="flex flex-col gap-3">
                <label htmlFor="repo-url" className="text-sm font-medium text-foreground">
                  GitHub Repository or Vercel Deployment URL
                </label>
                <Input
                  id="repo-url"
                  type="url"
                  placeholder="https://github.com/username/icu-readmission-model"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Make sure the repository is public or the deployment is accessible.
                </p>
              </div>
            </TabsContent>

            {/* Text Entry Tab */}
            <TabsContent value="text">
              <div className="flex flex-col gap-3">
                <label htmlFor="text-entry" className="text-sm font-medium text-foreground">
                  Paste your code or markdown write-up
                </label>
                <textarea
                  id="text-entry"
                  rows={12}
                  placeholder="# ICU Readmission Model&#10;&#10;## Approach&#10;Paste your code, markdown, or explanation here..."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action footer */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="ghost" onClick={onCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitted}
              className="gap-2 px-8"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submitted
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Submit Assignment
                </>
              )}
            </Button>
          </div>
        </section>
      </div>
      <Toaster />
    </>
  )
}
