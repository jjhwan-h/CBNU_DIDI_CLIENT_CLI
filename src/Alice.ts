import type { BaseRecordConstructor, ConnectionRecord, CredentialExchangeRecord, ProofExchangeRecord, TagsBase,SelectCredentialsForProofRequestReturn } from '@aries-framework/core'

import { BaseAgent } from './BaseAgent'
import { greenText, Output, redText } from './OutputClass'
import {AskarStorageService} from '@aries-framework/askar'
import { AgentContext, BaseRecord } from '@aries-framework/core';


class CustomRecord extends BaseRecord{
  public getTags(): TagsBase{
    return {}
  }
}
export class Alice extends BaseAgent {
  public connected: boolean
  public connectionRecordFaberId?: string

  public constructor(port: number, name: string, pw:string) {
    super({ port, name, pw })
    this.connected = false
  }

  public static async build(walletName:string, walletPw:string): Promise<Alice> {
    const alice = new Alice(3006, walletName, walletPw)
    await alice.initializeAgent()
    return alice
  }

  private async save(record:BaseRecord){
    const storage = new AskarStorageService;
    storage.save(this.agent.context,record);
  }
  
  private async getById(recordClass:BaseRecordConstructor<CustomRecord>, id:string):Promise<BaseRecord<TagsBase,TagsBase,{}>  | null>{
    const storage = new AskarStorageService;
    let record;
    try{
      record = await storage.getById(this.agent.context,recordClass,id);
      console.log(record.metadata);
    }catch{
      record=null
    }
    return record
  }

  private async deleteById(id:string){
    const storage = new AskarStorageService;
    const record:BaseRecord = new CustomRecord();
    record.id=id;
    const res = await storage.delete(this.agent.context,record)
  }

  private async getConnectionRecord() {
    if (!this.connectionRecordFaberId) {
      throw Error(redText(Output.MissingConnectionRecord))
    }
    return await this.agent.connections.getById(this.connectionRecordFaberId)
  }

  private async receiveConnectionRequest(invitationUrl: string) {
    const { connectionRecord } = await this.agent.oob.receiveInvitationFromUrl(invitationUrl)
    if (!connectionRecord) {
      throw new Error(redText(Output.NoConnectionRecordFromOutOfBand))
    }
    return connectionRecord
  }

  private async waitForConnection(connectionRecord: ConnectionRecord) {
    connectionRecord = await this.agent.connections.returnWhenIsConnected(connectionRecord.id)
    this.connected = true
    console.log(greenText(Output.ConnectionEstablished))
    return connectionRecord.id
  }

  public async acceptConnection(invitation_url: string) {
    const connectionRecord = await this.receiveConnectionRequest(invitation_url)
    this.connectionRecordFaberId = await this.waitForConnection(connectionRecord)
  }

  public async acceptCredentialOffer(credentialRecord: CredentialExchangeRecord) {
    await this.agent.credentials.acceptOffer({
      credentialRecordId: credentialRecord.id,
    })
  }

  public async acceptProofRequest(proofRecord: ProofExchangeRecord, requestedCredentials:SelectCredentialsForProofRequestReturn) {

    await this.agent.proofs.acceptRequest({
      proofRecordId: proofRecord.id,
      proofFormats: requestedCredentials.proofFormats,
    })
    console.log(greenText('\nProof request accepted!\n'))
  }

  public async sendMessage(message: string) {
    const connectionRecord = await this.getConnectionRecord()
    await this.agent.basicMessages.sendMessage(connectionRecord.id, message)
  }

  public async exit() {
    console.log(Output.Exit)
    await this.agent.shutdown()
    process.exit(0)
  }

  public async restart() {
    await this.agent.shutdown()
  }
}