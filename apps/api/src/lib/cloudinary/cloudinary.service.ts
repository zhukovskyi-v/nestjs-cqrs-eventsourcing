import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

export interface UploadOptions {
  ownerId: string;
  originalName: string;
  isPublic: boolean;
  contentType: string;
}

export interface UploadResult {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
  assetId: string;
}

type CloudinaryUploadResult = UploadApiResponse & {
  asset_id: string;
  asset_folder: string;
  display_name: string;
};

type ResourceType = 'image' | 'raw';
type DeliveryType = 'upload' | 'authenticated';

interface SearchResource {
  public_id: string;
  format?: string;
  resource_type: ResourceType;
  type: DeliveryType;
  bytes: number;
  secure_url: string;
}

function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'object' && value !== null && 'message' in value) {
    return new Error(String(value.message));
  }
  return new Error(typeof value === 'string' ? value : 'Unknown error');
}

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    cloudinary.config({
      cloud_name: this.config.getOrThrow<string>('cloudinary.cloudName'),
      api_key: this.config.getOrThrow<string>('cloudinary.apiKey'),
      api_secret: this.config.getOrThrow<string>('cloudinary.apiSecret'),
    });
  }

  async upload(buffer: Buffer, opts: UploadOptions): Promise<UploadResult> {
    try {
      const result = await this.streamUpload(buffer, {
        folder: this.folderFor(opts.ownerId),
        public_id: this.buildPublicId(opts.originalName),
        resource_type: this.resourceTypeFor(opts.contentType),
        type: opts.isPublic ? 'upload' : 'authenticated',
      });

      return {
        url: result.secure_url,
        pathname: result.public_id,
        size: result.bytes,
        contentType: opts.contentType,
        assetId: result.asset_id,
      };
    } catch (e) {
      console.error(`error in upload file to Cloudinary: ${e}`);
      throw e;
    }
  }

  async copy(srcPathname: string, ownerId: string): Promise<UploadResult> {
    const resource = await this.getResource(srcPathname);
    if (!resource) {
      throw new Error(`Cloudinary resource ${srcPathname} not found`);
    }

    const originalName = srcPathname.split('/').pop() ?? 'copy';
    const result = await cloudinary.uploader.upload(resource.secure_url, {
      folder: this.folderFor(ownerId),
      public_id: this.buildPublicId(originalName),
      resource_type: resource.resource_type,
      type: resource.type,
    });

    return {
      url: result.secure_url,
      pathname: result.public_id,
      size: result.bytes,
      contentType: resource.format
        ? `${resource.resource_type}/${resource.format}`
        : resource.resource_type,
      assetId: result.asset_id as string,
    };
  }

  async destroy(assetId: string): Promise<void> {
    const outcome = await this.tryDestroy(assetId);
    if (outcome === 'ok') {
      return;
    }
    if (outcome !== 'not found') {
      throw new Error(`Cloudinary destroy returned: ${outcome}`);
    }
    this.logger.warn(`Asset ${assetId} already gone from Cloudinary`);
  }

  private async tryDestroy(assetId: string): Promise<string> {
    const res = (await cloudinary.api.delete_resources_by_asset_ids([
      assetId,
    ])) as unknown as {
      deleted: Record<string, string>;
      partial: boolean;
      rate_limit_allowed: number;
      rate_limit_reset_at: Date;
      rate_limit_remaining: number;
    };

    return Object.keys(res.deleted).length ? 'ok' : 'not found';
  }

  private streamUpload(
    buffer: Buffer,
    options: {
      folder: string;
      public_id: string;
      resource_type: ResourceType;
      type: DeliveryType;
    },
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, response) => {
          if (error) {
            reject(toError(error));
            return;
          }
          if (!response) {
            reject(new Error('Cloudinary upload returned no response'));
            return;
          }
          resolve(response as CloudinaryUploadResult);
        },
      );
      stream.end(buffer);
    });
  }

  private folderFor(ownerId: string): string {
    return `uploads/${ownerId}`;
  }

  private buildPublicId(originalName: string): string {
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    return `${Date.now()}-${safeName}`;
  }

  private resourceTypeFor(contentType: string): ResourceType {
    return contentType.startsWith('image/') ? 'image' : 'raw';
  }

  private async getResource(publicId: string): Promise<SearchResource | null> {
    const result = (await cloudinary.search
      .expression(`public_id="${publicId}"`)
      .max_results(1)
      .execute()) as { resources: SearchResource[] };
    return result.resources[0] ?? null;
  }
}
