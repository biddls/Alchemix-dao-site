//tile 1 attack from tile 2 attack to force

const commenceAttack = async function (
    AttackX,
    AttackY,
    FromX,
    FromY,
    AttackAmount,
    MagicAttack,
    account) {
    await MagicAttack.methods.magicAttack(
        AttackX,
        AttackY,
        FromX,
        FromY,
        AttackAmount
    ).send({from: account})
}

export default commenceAttack