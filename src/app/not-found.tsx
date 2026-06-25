import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Page not found"
        description="The page you are looking for does not exist or may have moved."
      />
      <EmptyState
        title="404"
        description="Check the URL or return to the task list."
        action={
          <>
            <Button render={<Link href="/" />}>View tasks</Button>
            <Button variant="outline" render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
          </>
        }
        className="max-w-lg"
      />
    </div>
  );
}
