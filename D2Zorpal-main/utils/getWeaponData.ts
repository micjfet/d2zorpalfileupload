import axios from 'axios';
import type {instancedWeaponData, publicWeaponData} from '@/types/bungie';
import rawCsv from "weaponscsv/data.csv";


// use this https://data.destinysets.com/api/Destiny2.GetProfile?destinyMembershipId=4611686018448344231&membershipType=1&components=102%2C103%2C104%2C205%2C300%2C302
export function getWeaponData(itemHash: string, itemInstanceId: string, membershipType: number, destinyMembershipId: string) {
  
};