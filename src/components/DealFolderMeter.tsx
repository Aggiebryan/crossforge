"use client";

import { useMemo, useState } from "react";
import { DEAL_FOLDERS, DOCUMENT_TYPES, SAVE_EVERYTHING_CHECKLIST } from "@/domain/constants";
import { buildFilename } from "@/domain/engines/files";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle } from "@/components/ui/primitives";
import type { DemoLead } from "@/demo/data";
import { Folder, Upload } from "lucide-react";

const SAVE_LABELS: Record<string, string> = {
  seller_lead_sheet: "Seller lead sheet",
  deal_analysis_sheet: "Deal analysis sheet",
  signed_contract: "Signed contract",
  title_communications: "Title communications",
  buyer_proof_of_funds: "Buyer proof of funds",
  buyer_agreement: "Buyer agreement",
  closing_statement: "Closing statement",
  key_threads: "Key text / email threads",
  property_photos: "Property photos",
};

export function DealFolderMeter({ lead }: { lead: DemoLead }) {
  const [docType, setDocType] = useState("ExecutedContract");
  const ext = "pdf";

  // Seed completion by stage progression for the demo.
  const done = useMemo(() => {
    const set = new Set<string>();
    set.add("seller_lead_sheet");
    if (!lead.is_incomplete) set.add("property_photos");
    if (["under_contract", "title_opened", "disposition_active", "assigned", "closed"].includes(lead.stage)) {
      set.add("deal_analysis_sheet");
      set.add("signed_contract");
      set.add("title_communications");
    }
    if (["disposition_active", "assigned", "closed"].includes(lead.stage)) {
      set.add("buyer_proof_of_funds");
    }
    return set;
  }, [lead]);

  const built = (() => {
    try {
      return buildFilename(docType, lead.street, "2026-07-20", ext);
    } catch {
      return null;
    }
  })();

  const pct = Math.round((done.size / SAVE_EVERYTHING_CHECKLIST.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Deal folder</span>
          <Badge tone={pct === 100 ? "ok" : "neutral"}>{pct}% saved</Badge>
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Fixed subfolders */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {DEAL_FOLDERS.map((f) => (
            <div key={f} className="flex items-center gap-1.5 rounded border border-border px-2 py-1.5 text-[11px] text-fg-muted">
              <Folder className="h-3 w-3 text-fg-faint" /> {f}
            </div>
          ))}
        </div>

        {/* Enforced filename builder */}
        <div className="rounded border border-border bg-bg p-3">
          <div className="mb-2 text-xs font-medium text-fg">Upload — filename is auto-built</div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-[10px] text-fg-muted">Document type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="rounded border border-border bg-bg-elev px-2 py-1 text-xs text-fg"
              >
                {Object.entries(DOCUMENT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" className="gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Choose file
            </Button>
          </div>
          {built && (
            <div className="mt-2 text-[11px]">
              <span className="text-fg-muted">Files to </span>
              <span className="font-mono text-accent">{built.folder}</span>
              <span className="text-fg-muted"> as </span>
              <span className="font-mono text-fg">{built.filename}</span>
            </div>
          )}
          <p className="mt-1 text-[10px] text-fg-faint">
            Manual filenames are not accepted. The app builds
            YYYY-MM-DD_PropertyAddress_DocumentType from the controlled vocabulary.
          </p>
        </div>

        {/* Save-everything meter */}
        <div>
          <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-bg-elev-2">
            <div className="h-full bg-ok transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {SAVE_EVERYTHING_CHECKLIST.map((k) => (
              <div key={k} className="flex items-center gap-2 text-[12px]">
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded-full border ${
                    done.has(k) ? "border-ok bg-ok" : "border-border"
                  }`}
                />
                <span className={done.has(k) ? "text-fg" : "text-fg-faint"}>{SAVE_LABELS[k]}</span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
