"use client"

import { HelpCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/context"

interface PageHelpProps {
  title: string
  description: string
  steps?: string[]
}

export function PageHelp({ title, description, steps }: PageHelpProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t, dir } = useTranslation()

  return (
    <div className="mb-8">
      {!isOpen ? (
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          {t("Show Help")}
        </Button>
      ) : (
        <Card className="mb-6" dir={dir}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>
                {t("Help")}: {t(title)}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                {t("Close")}
              </Button>
            </div>
            <CardDescription>{t(description)}</CardDescription>
          </CardHeader>
          {steps && steps.length > 0 && (
            <CardContent>
              <h4 className="font-medium mb-2">{t("Steps")}:</h4>
              <ol className="list-decimal list-inside space-y-1">
                {steps.map((step, index) => (
                  <li key={index}>{t(step)}</li>
                ))}
              </ol>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
