import { prisma } from "./prisma";

export interface AuditInput {
  userId?: string | null;
  patientId?: string | null;
  reportId?: string | null;
  resultId?: string | null;
  shareId?: string | null;
  action: string;
  detail?: string | null;
}

export async function logAudit(input: AuditInput) {
  try {
    await prisma.auditLogRoleAccess.create({
      data: {
        userId: input.userId ?? null,
        patientId: input.patientId ?? null,
        reportId: input.reportId ?? null,
        resultId: input.resultId ?? null,
        shareId: input.shareId ?? null,
        action: input.action,
        detail: input.detail ?? null,
      },
    });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}

export const AUDIT_EVENTS: Record<string, string> = {
  "report.uploaded": "Report uploaded",
  "report.processed": "Report processed",
  "report.confirmed": "Report confirmed",
  "report.deleted": "Report deleted",
  "report.renamed": "Report renamed",
  "result.edited": "Lab result edited",
  "result.confirmed": "Lab result confirmed",
  "result.rejected": "Lab result rejected",
  "patient.changed": "Patient information changed",
  "share.created": "Share link created",
  "share.revoked": "Share link revoked",
  "share.accessed": "Share link accessed",
  "export.generated": "Export generated",
  "reminder.created": "Reminder created",
  "reminder.completed": "Reminder completed",
  "reminder.cancelled": "Reminder cancelled",
  "range.created": "Reference range added",
  "range.updated": "Reference range updated",
  "range.deleted": "Reference range deleted",
};