/*
 * Copyright 2020 Coöperatieve Rabobank U.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ChallengeRequest } from 'vp-toolkit-models'
import { CryptUtil } from 'crypt-util'

export class ChallengeRequestSigner {

  constructor (private _cryptUtil: CryptUtil) {
  }

  get signatureType () {
    return this._cryptUtil.algorithmName + 'Signature2019'
  }

  get cryptUtil () {
    return this._cryptUtil
  }

  /**
   * Signs the ChallengeRequest model and returns the SignatureValue.
   * Because CryptUtil is being used, we need to provide an
   * accountId and keyId so the challengerequest is signed with
   * the correct derivated key. If you use only one key for
   * every sign action, use 0 for accountId and keyId.
   *
   * @param {ChallengeRequest} model
   * @param {number} accountId
   * @param {number} keyId
   * @return string
   */
  public signChallengeRequest (model: ChallengeRequest, accountId: number, keyId: number): string {
    return this._cryptUtil.signPayload(accountId, keyId, JSON.stringify(model))
  }

  /**
   * Verifies the ChallengeRequest model and its SignatureValue.
   *
   * @param {ChallengeRequest} model
   * @return boolean
   */
  public verifyChallengeRequest (model: ChallengeRequest): boolean {
    const publicKey = model.proof.verificationMethod
    const signature = String(model.proof.signatureValue as string) // Copy the SignatureValue before removing it from the model
    model.proof.signatureValue = undefined // Removed the SignatureValue because that field was also empty when signing the payload
    const payload = JSON.stringify(model)

    return this._cryptUtil.verifyPayload(payload, publicKey, signature)
  }
}
