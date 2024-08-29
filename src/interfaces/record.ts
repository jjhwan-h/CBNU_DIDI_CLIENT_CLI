import type { TagsBase } from "@aries-framework/core"

import { BaseRecord } from "@aries-framework/core"
import { Metadata } from "@aries-framework/core/build/storage/Metadata";
export class CustomRecord extends BaseRecord{
    public getTags(): TagsBase{
      return {}
    }
  }

  interface DidTags extends TagsBase {
    publicKey: string;
    privateKey: string; 
  }
  
export class DidRecord extends BaseRecord<TagsBase, DidTags> {
    readonly type = 'CustomRecord';
  
    constructor(id: string, createdAt: Date, metadata: Metadata<{}>) {
      super();
      this.id = id;
      this.createdAt = createdAt;
      this.metadata = metadata;
    }
  
    // Custom tags를 포함한 모든 태그 반환
    getTags(): DidTags {
      return this._tags;
    }
  }
