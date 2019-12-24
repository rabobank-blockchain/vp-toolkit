import { IVerifiablePresentationParams, VerifiablePresentation } from 'vp-toolkit-models';
import { VerifiablePresentationSigner } from '../..';
export declare class VerifiablePresentationGenerator {
    private _signer;
    constructor(_signer: VerifiablePresentationSigner);
    /**
     * Generate a signed Verifiable Presentation (VP) object.
     *
     * Because CryptUtil is being used by the VerifiablePresentationSigner,
     * we need to provide accountIds and keyIds so the
     * VP is provided with the correct ownership proofs.
     * If you use only one global key for your product,
     * then provide the accountId and keyId once.
     *
     * The VP proof array will be overwritten with a Proof set.
     * Proof chains are not supported.
     * @see https://w3c-dvcg.github.io/ld-proofs/#proof-sets
     *
     * @param {IVerifiablePresentationParams} params the proof will be overwritten!
     * @param {{accountId: number, keyId: number}[]} keys used to prove ownership over each VC inside
     * @param {string|undefined} correspondenceId optional value to use as proof.nonce field
     * @return VerifiablePresentation
     */
    generateVerifiablePresentation(params: IVerifiablePresentationParams, keys: {
        accountId: number;
        keyId: number;
    }[], correspondenceId?: string): VerifiablePresentation;
}
