import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { FileDeletedEvent } from '@/modules/file/domain/events';
import { CloudinaryService } from '@/lib/cloudinary/cloudinary.service';

const RETRY_DELAYS_MS = [1000, 5000, 30000];

@Injectable()
@EventsHandler(FileDeletedEvent)
export class CloudinaryEventHandler implements IEventHandler<FileDeletedEvent> {
  private readonly logger = new Logger(CloudinaryEventHandler.name);

  constructor(private readonly cloudinary: CloudinaryService) {}

  handle(event: FileDeletedEvent): void {
    void this.purgeWithRetry(event.aggregateId, event.assetId, 0);
  }

  private async purgeWithRetry(
    fileId: string,
    assetId: string,
    attempt: number,
  ): Promise<void> {
    try {
      await this.cloudinary.destroy(assetId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (attempt < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[attempt];
        this.logger.warn(
          `Cloudinary destroy failed for ${assetId} (file ${fileId}, attempt ${attempt + 1}): ${message}. Retrying in ${delay}ms.`,
        );
        setTimeout(() => {
          void this.purgeWithRetry(fileId, assetId, attempt + 1);
        }, delay);
        return;
      }
      this.logger.error(
        `Cloudinary destroy permanently failed for ${assetId} (file ${fileId}) after ${RETRY_DELAYS_MS.length + 1} attempts: ${message}`,
      );
    }
  }
}
