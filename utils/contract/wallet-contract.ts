import {
  AddressType,
  ContractMethods,
  ContractOptions,
  SeqnoMethod,
  TransferMethod,
} from "tonweb"
import BN from "bn.js"
import { Cell } from "ton"
export interface WalletContractOptions extends ContractOptions {
  publickKey?: Uint8Array
}

export interface TransferMethodParams {
  secreKey: Uint8Array
  toAddress: AddressType
  amount: BN | number
  seqno: number
  payload?: string | Uint8Array | Cell
  sendMode?: number
  stateInit?: Cell
}

export interface WalletContractMethods extends ContractMethods {
  transfer: TransferMethod
  seqno: SeqnoMethod
}
