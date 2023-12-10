'use strict'

import Fs from '@supercharge/fs'
import { createHash } from 'node:crypto'

export class Inertia {
  /**
   * Returns the MD5 hash for the content of the given `manifestFilePath`.
   */
  public static async manifestFile (manifestFilePath: string): Promise<string> {
    if (await Fs.notExists(manifestFilePath)) {
      throw new Error(`Manifest file "${manifestFilePath}" does not exist.`)
    }

    return createHash('md5').update(
      await Fs.content(manifestFilePath)
    ).digest('hex')
  }
}
