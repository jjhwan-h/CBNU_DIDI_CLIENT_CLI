import * as Wallet from '@aries-framework/core/build/wallet';
import { AriesAskar, ariesAskar, ariesAskarNodeJS } from '@hyperledger/aries-askar-nodejs';
import {AskarStorageService} from '@aries-framework/askar'
import { AgentContext, BaseRecord } from '@aries-framework/core';
const newFunc = {
    save: (agentContext: AgentContext, record:BaseRecord)=>{
        const storage = new AskarStorageService;
        storage.save(agentContext,record);
    }
}

export const existingFunc = Object.assign({},Wallet,newFunc);