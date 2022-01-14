const KaKaoStrategy = require("passport-kakao").Strategy;

const { user } = require("../models");

module.exports = (passport) => {
  passport.use(
    new KaKaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await user.find({
            where: { snsId: profile.id, provider: "kakao" },
          });
          if (exUser) {
            done(null.exUser);
          } else {
            const newUser = await user.create({
              email: profile._json && profile._json.kaccount_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
