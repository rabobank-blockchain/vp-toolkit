import { VerifiableCredential } from 'vp-toolkit-models';
import { CryptUtil } from 'crypt-util';
export declare class VerifiableCredentialSigner {
    private _cryptUtil;
    constructor(_cryptUtil: CryptUtil);
    readonly signatureType: string;
    readonly cryptUtil: CryptUtil;
    /**
     * Signs the VerifiableCredential (VC) model and returns the SignatureValue.
     * Because CryptUtil is being used, we need to provide an
     * accountId and keyId so the VC is signed with
     * the correct derivated key. If you use only one key for
     * every sign action, use 0 for accountId and keyId.
     *
     * @param {VerifiableCredential} model
     * @param {number} accountId
     * @param {number} keyId
     * @return string
     */
    signVerifiableCredential(model: VerifiableCredential, accountId: number, keyId: number): string;
    /**
     * Verifies the VC's integrity (signature check)
     * and verifies that the vc.issuer field corresponds
     * with the public key that was used for signing the VC.
     *
     * NOTE: The VC.issuer field must end with an ethereum
     * address! Other DID's are not supported at this time.
     *
     * @param {VerifiableCredential} model
     * @return boolean
     */
    verifyVerifiableCredential(model: VerifiableCredential): boolean;
}
