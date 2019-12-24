import { IVerifiableCredentialParams, VerifiableCredential } from 'vp-toolkit-models';
import { VerifiableCredentialSigner } from '../..';
export declare class VerifiableCredentialGenerator {
    private _signer;
    constructor(_signer: VerifiableCredentialSigner);
    /**
     * Generate a signed Verifiable Credential (VC) object.
     *
     * Because CryptUtil is being used by the VerifiableCredentialSigner,
     * we need to provide an accountId and keyId so the
     * VC is signed with the correct derivated key.
     * If you use only one key for every sign action,
     * use 0 for accountId and keyId.
     *
     * @param {IVerifiableCredentialParams} params without proof!
     * @param {number} accountId
     * @param {number} keyId
     * @return ChallengeRequest
     */
    generateVerifiableCredential(params: IVerifiableCredentialParams, accountId: number, keyId: number): VerifiableCredential;
}
