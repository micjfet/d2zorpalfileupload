// types/bungie.ts
export type BungieProfile = {
  bungieNetUser: {
    displayName: string;
    profilePicturePath: string;
  };
  primaryMembershipId: string;
  primaryMembershipType: number;
  destinyMemberships: Array<{
    displayName: string;
    membershipType: number;
    membershipId: string;
  }>;
}

export type DestinyProfile = {
  characters: Array<{
    characterId: string;
    classType: number;
    lightLevel: number;
    emblemPath: string;
  }>;
}

export type instancedWeaponData = {
  // https://data.destinysets.com/api/Destiny2.GetItem?components=302%2C307&destinyMembershipId=4611686018448344231&membershipType=1&itemInstanceId=6917530072461179475
  item: {
    data: {
      itemInstanceId: string;
      itemHash: string;
      location: number;
      bucketHash: number;
      transferStatus: number;
      lockable: boolean;
    }
  }
  perks: {
    data:{
      perks: Array<{
        perkHash: number;
        iconPath: string;
        isActive: boolean;
        visible: boolean;
      }>
    }
  }
}

export type publicWeaponData = {
  // https://data.destinysets.com/api/Destiny2.GetDestinyEntityDefinition?hashIdentifier=3211624072&entityType=DestinyInventoryItemDefinition
  displayProperties: {
    name: string;
    icon: string;
  }
  itemTypeDisplayName: string;
  itemTypeAndTierDisplayName: string;
  inventory: {
    tierTypeName: string;
    tierType: number;
  }
  
}

export type WeaponData = {
  instanced: instancedWeaponData;
  public: publicWeaponData;
}