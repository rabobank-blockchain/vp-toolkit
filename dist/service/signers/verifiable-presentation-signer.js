"use strict";
/*
 * Copyright 2019 Rabobank NL
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
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class VerifiablePresentationSigner {
    constructor(_cryptUtil, _verifiableCredentialSigner) {
        this._cryptUtil = _cryptUtil;
        this._verifiableCredentialSigner = _verifiableCredentialSigner;
    }
    get signatureType() {
        return this._cryptUtil.algorithmName + 'Signature2019';
    }
    get cryptUtil() {
        return this._cryptUtil;
    }
    /**
     * Creates a proof objects for the VerifiableCredentials.
     * Because CryptUtil is being used, we need to provide an
     * accountId and keyId so the VC is signed with
     * the correct derivated key. If you use only one global
     * key for your product, then provide the accountId and
     * keyId once.
     *
     * A random uuid will be used if the correspondenceId
     * is not provided.
     *
     * @param vp the verifiable presentation parameters (not the object itself)
     * @param {{accountId: number, keyId: number}[]} keys
     * @param {string} correspondenceId to use as proof nonce to prove the session between holder and counterparty
     * @return IProofParams[]
     */
    generateProofs(vp, keys, correspondenceId) {
        const proofs = [];
        for (const vc of vp.verifiableCredential) {
            for (const keySet of keys) {
                const address = this._cryptUtil.deriveAddress(keySet.accountId, keySet.keyId);
                // The if statement checks if this keyset can prove the ownership over this VC in two ways
                if (!vc.issuer.endsWith(address) // Cannot prove this as a self attested VC
                    && (!vc.credentialSubject.id || !vc.credentialSubject.id.endsWith(address))) { // Also not as a third-party VC
                    continue; // Go to the next keyset
                }
                // Apparently we can use this keyset to prove ownership over this VC
                const nonce = correspondenceId || uuid_1.v4(); // If the correspondenceId was not provided, a random uuid will be used
                const date = new Date();
                const payload = JSON.stringify(vc) + nonce + date.toISOString();
                const sigValue = this._cryptUtil.signPayload(keySet.accountId, keySet.keyId, payload);
                const pubKey = this._cryptUtil.derivePublicKey(keySet.accountId, keySet.keyId);
                proofs.push({
                    type: this.signatureType,
                    created: date,
                    verificationMethod: pubKey,
                    nonce: nonce,
                    signatureValue: sigValue
                });
            }
        }
        return proofs;
    }
    /**
     * Verifies all VerifiableCredential
     * signatures.
     *
     * Optionally verifies the
     * ownership signatures from the
     * VerifiablePresentation.
     *
     * Only proof sets are supported.
     * @see https://w3c-dvcg.github.io/ld-proofs/#proof-sets
     *
     * @param {VerifiablePresentation} model
     * @param {string|undefined} correspondenceId this string must be included in the VP proof if ownership is validated
     * @param {boolean} skipOwnershipValidation
     * @return boolean
     */
    verifyVerifiablePresentation(model, skipOwnershipValidation = false, correspondenceId) {
        for (const vc of model.verifiableCredential) {
            if (!this._verifiableCredentialSigner.verifyVerifiableCredential(vc)) {
                return false;
            }
            if (skipOwnershipValidation) {
                continue;
            }
            // Check credential ownership by looping through the VP proofs and find the matching proof
            let ownershipIsValid = false;
            for (const vpProof of model.proof) {
                const ownershipSignature = vpProof.signatureValue;
                const payloadToVerifiy = JSON.stringify(vc) + vpProof.nonce + vpProof.created;
                if (this._cryptUtil.verifyPayload(payloadToVerifiy, vpProof.verificationMethod, ownershipSignature)
                    && (correspondenceId === undefined || vpProof.nonce === correspondenceId)) {
                    ownershipIsValid = true;
                    break;
                }
            }
            if (!ownershipIsValid) {
                return false;
            }
        }
        return true;
    }
}
exports.VerifiablePresentationSigner = VerifiablePresentationSigner;
//# sourceMappingURL=verifiable-presentation-signer.js.map