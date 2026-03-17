import { cn } from '@/lib/utils';
import { getStatusBorderClass } from '@/lib/status-utils';
import { EquipmentStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: EquipmentStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 text-[0.65rem] font-bold uppercase font-mono border rounded-sm',
      getStatusBorderClass(status)
    )}>
      {status}
    </span>
  );
}
