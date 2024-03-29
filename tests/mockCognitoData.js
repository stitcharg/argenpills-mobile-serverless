const mockCognitoData =     {
    '$metadata': {
      httpStatusCode: 200,
      requestId: '7c1e38a5-4ced-4528-a613-4fd3a2daa278',
      extendedRequestId: undefined,
      cfId: undefined,
      attempts: 1,
      totalRetryDelay: 0
    },
    AuthenticationResult: {
      AccessToken: 'eyJraWQiOiI1cEEzNGxLNmRpb2EzM0ZScGcrUkg0NHhNK3E2Qm5DYTluNU5XU3VlSTVBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJhYjNlYzRhZC0yYjZkLTQ5YWQtOTczYi0xMjc2MTVmMzBlODYiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9HbUowUkVibEMiLCJjbGllbnRfaWQiOiJ0OG1zZDFtdXB0MjEwc3NjaTUzNjF2ajZsIiwib3JpZ2luX2p0aSI6ImM2MThkZTFlLTMxZjgtNGE5Ni1hMjI0LWYxMGE3NzRlODVlMSIsImV2ZW50X2lkIjoiN2MxZTM4YTUtNGNlZC00NTI4LWE2MTMtNGZkM2EyZGFhMjc4IiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY5NzgzMjc4MywiZXhwIjoxNjk3ODM2MzgzLCJpYXQiOjE2OTc4MzI3ODMsImp0aSI6IjUyZDIxOTljLTkxM2MtNDFiMS05NWUwLTFkMmU2ZTBlMjIxOSIsInVzZXJuYW1lIjoiVGVzdCJ9.Kj6tZ-0_d8uMiYODQmhP6h-on2gBg8WWclGHx-keaPtnJXu8xne1Q4WR3SWNmuu-02cdVmzLjYKy6wPsFQNW2a3j8oAo-Ge7DYmclFXFSIhjPRBRwdLsBgP4umJeCpxs92MNXTOJQAJlT3RnCEATvuSaGPyiqoO8NkxqJS_QIXHGQdopoUegPsyCVGphubPiaRcr_0tj7fYwvU7ygO4Jt4_EjD5ONULFsGIdleYPhdT1JWqAUQ_y0R8OhA3oIDDLxEQBT-AD-pWT3afkqhO3CJZRDolJtPoUf5IH3Lk1O4c2MXP6QMrrVN_555XxqZ2sN8d93_trKE7g1t00lXhPNw',
      ExpiresIn: 3600,
      IdToken: 'eyJraWQiOiJuQzhuR2Rlb2hSd1g2eW5aWlZwTzRuUElUQ1dsZ3pZcXZxTDVycnFtM1R3PSIsImFsZyI6IlJTMjU2In0.eyJvcmlnaW5fanRpIjoiYzYxOGRlMWUtMzFmOC00YTk2LWEyMjQtZjEwYTc3NGU4NWUxIiwic3ViIjoiYWIzZWM0YWQtMmI2ZC00OWFkLTk3M2ItMTI3NjE1ZjMwZTg2IiwiYXVkIjoidDhtc2QxbXVwdDIxMHNzY2k1MzYxdmo2bCIsImV2ZW50X2lkIjoiN2MxZTM4YTUtNGNlZC00NTI4LWE2MTMtNGZkM2EyZGFhMjc4IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2OTc4MzI3ODMsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX0dtSjBSRWJsQyIsImNvZ25pdG86dXNlcm5hbWUiOiJUZXN0IiwiZXhwIjoxNjk3ODM2MzgzLCJpYXQiOjE2OTc4MzI3ODMsImp0aSI6IjQ1ODZlNjVlLWE0NzUtNDQyYi1iOWU2LWUxOWEwMjhiNGVjNSJ9.oRWDZ9iGtRQLwHJw3IbNm5OW6inw7T3n-B1h_4VJFVvXat9qEygoZYqlSWpc83A79NbpU2EDhqrh__sAx6uhd4XMVlQdGNNAGd-KRNQOsuKXcvZzTrPDWekPjwh8Jjqwemvj8w06HdT-ByB-J9E-46NLVXCMvhHf-2PQ6MRA0BbPGODu7CA5q1I6day9pYZXfqzQJr20e6o7M7yWdVON1k9C73Is4sfrXZJ4VjVMmV_ImliGT68viqH0TSIi__zk4tPbDzTU7F8fPVlsdfHvY0mJO6CVdNERgRBW8gmnux4HzF8hNhIT8DQniYxi2t6tvKVVoFz77nPXCDXw090i2A',
      RefreshToken: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.Z0bNwb0cWHlzM_2VffVFvhSa0lUsh-zP0RxdsZEKEVPF866S4EaMnc_nGX4JqWpHZ4GJ1bFp36r_PliDEGXx-OOQXGgwEDiNNucVDrldNHGh92P7U_yjyisr7EkfNKhms3SXd0i2lhC2O8ulJ2tkiYLPvkXo9hRP_kLVSwf6d56C4arIKiActcPIlRsNcY1fasIY8xJd5easJMjWi5XR-9rvAeOA-EwUSn2n1NnfAN9vAcJR2v2XHTAg9NQpTxMKoz0JERSpMsTXwEWDSJKbMcCfUEm3oHjO4HOwqBtqaAGj7oH7IuXFqAlQH460o6V9hmqnh0zEo4WdlmG95whPvQ.yit71vWi3z1CHzBc.e3jN2GdtGag1Ia6SJZoq_hIaA3l5W2oqbrDvawi67m4a-hd3zcCgCAs89NKM73WVVeJ5ndX4V-elgFLdVitDVsdicT8s9qC9DW7f5i7m6xaufOli4Rp-E8q_-hq_8G5t_LIuIyEmx4heeVzLriHYSR6ziuZh49_24tp9UowPijHqrEqs-NIEoR-yab-ME0JbdtIrLEHrl_l17JKJ0tn9tDJdtxujZQnR0tDY8_t-JwuqDINp3MH12C3-w1iFQcCKSuPxyL9emeCSZ3IAjAaB44BEdb52PIRmibM5P1BjEElE4XTY6v6coG_5DfwL6p_ksXBRm2Te0MUMOWMPgI4RII0M80ZduFm8KawYuvWOtdxOqIN6oEJNwDCGIabrnRDUhX2EdffZ10j70UYTxSqOkb29hzgcV6bvFnIAQZbGI0SHjFSySULw1jYONLw5aMCrNVp9Z5exlw02CMPXZfSwfrGFHq53L7pWnvawiHePcMo8uoiZRbdz1qczhB33pcMSwoueK1-D5Wqniou0ACtLlJcnE3qiKQQWFuJsbkM6Jlie35PV8WDlCBFvUepCHinJptcoXsF07N6EukRo6tB2HaE5PS0fueUA_JYFaI1GMbtqrb-GdBktDBnWB0PUCRSbBVLnmvqC1R0771XXdzdW9wsUoPZKLRnW2S2DJWClO6S-P3em84oyWqohRX3DW0GOClfNrmTmCuhQRamqwxYARbaBjOPEJ21peazPSaRxjWx68gyzFR-dBhXw5m7VNY3C0jQmXT4a8QXXLLdP9NnSz1qUhg9g1c48UlU5JywJeXDcl8HoJr2MImdYPG28a4yM4cLpsDRlOJtgPSj8noN0BtzmS1YQH7_mr6EvEf5fbrm-5fM4s6c2gNAERFfH_YEiitnzy_NcCfbX3AUlssVwmSJ4kFZmKcfMhwEiKvqeFlOYyVJ14fNSATomkUhaXr0fkr_uhFIAdABmLa_mPKqwh856iBveegeccf82663buA7hzDiXATSRXbrgoGPzmxyltRUOlzrUwwrBH4NrY5HijnaRvI3B2-1g84BFLZ0oCmS69CvO--CFxe0gBVD1dOKzbxJDz42w7IHu7uhHhgLtLDB7WgW7VrS3EXwTCSGPQp1FVgK2o8jnJlYZ1HLPfGGKGBec4qtaBkZiosbyb5bKxy-jGKE3O67GoPqr0YEMRVFD4frMg7kzQNP_CizvjQhNHSnSx0maAZefml6Zd7z8PML1P8RGTnUHW4-i2Tog3pa37_fSw9kTatirScckJOM.F9mFtVOI7tEDpL8EDWzhEw',
      TokenType: 'Bearer'
    },
    ChallengeParameters: {}
}

const mockRefreshToken = {
    
}

module.exports = { 
    mockCognitoData
};