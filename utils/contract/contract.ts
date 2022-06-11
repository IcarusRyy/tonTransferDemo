import { Cell } from "ton"
import { AddressType } from "tonweb"

export interface ContractOptions {
  code?: Cell
  address?: AddressType
  wc?: number
}
