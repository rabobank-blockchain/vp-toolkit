import { ChallengeRequest, IChallengeRequestParams } from 'vp-toolkit-models';
import { ChallengeRequestSigner } from '../..';
export declare class ChallengeRequestGenerator {
    private _signer;
    constructor(_signer: ChallengeRequestSigner);
    /**
     * Generate a signed Challenge Request object.
     *
     * Because CryptUtil is being used by the ChallengeRequestSigner,
     * we need to provide an accountId and keyId so the
     * challengerequest is signed with the correct derivated key.
     * If you use only one key for every sign action,
     * use 0 for accountId and keyId.
     *
     * @param {IChallengeRequestParams} params without proof!
     * @param {number} accountId
     * @param {number} keyId
     * @return ChallengeRequest
     */
    generateChallengeRequest(params: IChallengeRequestParams, accountId: number, keyId: number): ChallengeRequest;
}
