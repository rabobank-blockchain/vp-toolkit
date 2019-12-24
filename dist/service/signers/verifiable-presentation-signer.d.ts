import { IProofParams, IVerifiablePresentationParams, VerifiablePresentation } from 'vp-toolkit-models';
import { CryptUtil } from 'crypt-util';
import { VerifiableCredentialSigner } from './verifiable-credential-signer';
export declare class VerifiablePresentationSigner {
    private _cryptUtil;
    private _verifiableCredentialSigner;
    constructor(_cryptUtil: CryptUtil, _verifiableCredentialSigner: VerifiableCredentialSigner);
    readonly signatureType: string;
    readonly cryptUtil: CryptUtil;
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
    generateProofs(vp: IVerifiablePresentationParams, keys: {
        accountId: number;
        keyId: number;
    }[], correspondenceId?: string): IProofParams[];
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
    verifyVerifiablePresentation(model: VerifiablePresentation, skipOwnershipValidation?: boolean, correspondenceId?: string): boolean;
}
