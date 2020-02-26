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

import * as chai from 'chai'
import {
  IVerifiableCredentialParams,
  IVerifiablePresentationParams,
  VerifiableCredential,
  VerifiablePresentation
} from 'vp-toolkit-models'
import { LocalCryptUtils } from 'crypt-util'
import { VerifiableCredentialSigner, VerifiablePresentationGenerator, VerifiablePresentationSigner } from '../../src'

const accountId = 0
const keyId = 0
const issuerKeys = {
  privKey: 'xprv9s21ZrQH143K3T7143BKMvxoLpFzUkoyU7sQS7iQ88FVGatVTvFe1sKU1Vvysj378AAvvTyjziPZ6AisTNV7uC9irDHEnxZqGYpeceP1S6c',
  pubKey: '58ffea3c24293e9939823b165a7e9c565077e2458e823a396bdcafa65a4b1e768463a4a80aaa76c15848a4c9c16ff19361ef529cd7b890748fc717a82afe6aae',
  address: '0xc62CE67381C12615e0b88FF8dD001609926498b8'
}
const holderKeys = { // Always generated as DID by the holder
  privKey: 'xprv9s21ZrQH143K2xcKPR8Z6GDyvxSRY2FpGNhwmpPcoJKZ3BaeVbixKaoEMAUTBQkjqnmFJXGwQuktCwNVrXUBLvLgjwK5iym9keD3FJN2RdC',
  pubKey: '5945c17dd10f13b0a6b860e6a6cc5ada7496f7718e9fef2bc31e6811d7c0a50491703adf65de62a5177b8812af5bb57586c4751e0ff2b6a7aa7d3c1dee48c670',
  address: '0x47b7b31b9346fBb4C960DA804250cD9619b3b704'
}

// The self-signed credential using the variables above
const selfSignedVcParams = {
  id: 'did:protocol:address',
  type: ['VerifiableCredential', 'DidOwnership'],
  issuer: 'did:eth:' + issuerKeys.address,
  issuanceDate: new Date('2019-01-01T23:34:45.000Z'),
  credentialSubject: { id: 'did:eth:' + issuerKeys.address },
  proof: {
    type: 'secp256k1Signature2019',
    created: new Date('2019-07-30T09:51:27.589Z'),
    verificationMethod: issuerKeys.pubKey,
    nonce: 'deebe007-ab09-4893-a3be-f47b465edd8c',
    signatureValue:
      'f9c38be2b468bd5fb853d2ce2ecf95b2223885802b5243c75a97b5645315efbc5b9ad936a23e8a7bd5081329ff9cf9c0d3722ae09ff3dce6eba0169d6d8e474f'
  },
  credentialStatus: {
    type: 'vcStatusRegistry2019',
    id: issuerKeys.address
  },
  '@context': undefined
}

// VP containing one self-attested credential
const selfSignedVpParams: IVerifiablePresentationParams = {
  id: 'urn:uuid:b6c9e11b-97ff-414f-99a2-e88cf4b6245e',
  type: ['VerifiablePresentation'],
  verifiableCredential: [new VerifiableCredential(selfSignedVcParams)]
}

// Credential generated by a third party
const issuerVcParams: IVerifiableCredentialParams = {
  id: 'did:protocol:address',
  type: ['VerifiableCredential'],
  issuer: 'did:eth:' + issuerKeys.address,
  issuanceDate: new Date(Date.UTC(2019, 0, 1, 23, 34, 56)),
  credentialSubject: {
    id: 'did:eth:' + holderKeys.address,
    type: 'John'
  },
  proof: {
    type: 'secp256k1Signature2019',
    created: new Date(Date.UTC(2019, 6, 30, 9, 8, 49, 665)),
    verificationMethod: issuerKeys.pubKey,
    nonce: '62a7c7e6-b025-4e00-8956-c3859dacfe92',
    signatureValue:
      'fb5cd8e00cea58c94422b605ab75d716bdabcb7be3b944f3760386bed62928772755a1cb657a23ee2fb1d3e5a0ca9ca12bb01f402b38bb20815ba47e97ef30cd'
  },
  credentialStatus: {
    type: 'vcStatusRegistry2019',
    id: issuerKeys.address
  },
  '@context': ['https://schema.org/givenName']
}

// VP containing one issuer credential and one self-attested credential
const mixedVpParams: IVerifiablePresentationParams = {
  id: 'urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5',
  type: ['VerifiablePresentation'],
  verifiableCredential: [new VerifiableCredential(selfSignedVcParams), new VerifiableCredential(issuerVcParams)]
}

before(() => {
  chai.should()
})

describe('Integration: Verifiable presentation generator, stringify, parse and validate signature', function () {
  const cryptUtil = new LocalCryptUtils()
  cryptUtil.importMasterPrivateKey(issuerKeys.privKey)
  const vcSigner = new VerifiableCredentialSigner(cryptUtil)
  const vpSigner = new VerifiablePresentationSigner(cryptUtil, vcSigner)
  const sut = new VerifiablePresentationGenerator(vpSigner)

  // A mixed VP contains self-attested credentials as well as issuer-attested credentials
  it('should generate, sign and then validate a mixed VP correctly', () => {
    const signedVp = sut.generateVerifiablePresentation(mixedVpParams, [{ accountId: accountId, keyId: keyId }])
    const isValid = vpSigner.verifyVerifiablePresentation(signedVp)

    isValid.should.be.equal(true)
  })

  it('should test', () => {
    console.log(vcSigner.signVerifiableCredential(new VerifiableCredential(issuerVcParams), 0, 0))
  })

  // A mixed VP contains self-attested credentials as well as issuer-attested credentials
  it('should generate, sign invalidly and then fail verification for a mixed VP', () => {
    const signedVp = sut.generateVerifiablePresentation(mixedVpParams, [{ accountId: accountId, keyId: keyId }])

    // Create invalid signature
    signedVp.proof[0].signatureValue = '9d967a97e935a17245593c0a4cd5faefa0b5282b9c46e0b358b05571211ddc5c775b0aa34fa4fc324acf029de20abeb2c47c3c72aa806025d75b672dfd2e16e1'

    const isValid = vpSigner.verifyVerifiablePresentation(signedVp)

    isValid.should.be.equal(false)
  })

  // A mixed VP contains self-attested credentials as well as issuer-attested credentials
  it('should generate, sign, stringify, parse and then validate a mixed VP correctly', () => {
    const signedVp = sut.generateVerifiablePresentation(mixedVpParams, [{ accountId: accountId, keyId: keyId }])
    const stringifiedVp = JSON.stringify(signedVp)
    const parsedVp = new VerifiablePresentation(JSON.parse(stringifiedVp))

    const cryptUtilx = new LocalCryptUtils()
    const vcSignerx = new VerifiableCredentialSigner(cryptUtilx)
    const vpSignerx = new VerifiablePresentationSigner(cryptUtilx, vcSignerx)
    const isValid = vpSignerx.verifyVerifiablePresentation(parsedVp)

    isValid.should.be.equal(true)
  })

  // A self-signed VP contains only self-signed credentials
  it('should generate, sign and then validate correctly for a self-signed VP', () => {
    const signedVp = sut.generateVerifiablePresentation(selfSignedVpParams, [{
      accountId: accountId,
      keyId: keyId
    }])
    const isValid = vpSigner.verifyVerifiablePresentation(signedVp)

    isValid.should.be.equal(true)
  })

  it('should generate, sign and then not validate correctly for an incorrect self-signed VP', () => {
    const signedVp = sut.generateVerifiablePresentation(selfSignedVpParams, [{
      accountId: accountId,
      keyId: keyId
    }])
    // Create invalid signature
    signedVp.proof[0].signatureValue = '9d967a97e935a17245593c0a4cd5faefa0b5282b9c46e0b358b05571211ddc5c775b0aa34fa4fc324acf029de20abeb2c47c3c72aa806025d75b672dfd2e16e1'

    const isValid = vpSigner.verifyVerifiablePresentation(signedVp)

    isValid.should.be.equal(false)
  })

  it('should generate, sign, stringify, parse and then validate correctly for a self-signed VP', () => {
    const signedVp = sut.generateVerifiablePresentation(selfSignedVpParams, [{
      accountId: accountId,
      keyId: keyId
    }])
    const stringifiedVp = JSON.stringify(signedVp)
    const parsedVp = new VerifiablePresentation(JSON.parse(stringifiedVp))
    const isValid = vpSigner.verifyVerifiablePresentation(parsedVp)

    isValid.should.be.equal(true)
  })
})
