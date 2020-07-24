import { ChallengeRequest } from 'vp-toolkit-models';
import { CryptUtil } from 'crypt-util';
export declare class ChallengeRequestSigner {
    private _cryptUtil;
    constructor(_cryptUtil: CryptUtil);
    readonly signatureType: string;
    readonly cryptUtil: CryptUtil;
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
    signChallengeRequest(model: ChallengeRequest, accountId: number, keyId: number): string;
    /**
     * Verifies the ChallengeRequest model and its SignatureValue.
     *
     * @param {ChallengeRequest} model
     * @return boolean
     */
    verifyChallengeRequest(model: ChallengeRequest): boolean;
}
